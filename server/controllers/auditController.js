import { AuditLog } from '../models/index.js';
import { logAuditEvent } from '../middleware/auditLogger.js';

export const getAuditLogs = async (req, res) => {
  try {
    const { status, role, action, limit = 100 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (role) query.role = role;
    if (action) query.action = action;

    const logs = await AuditLog.find(query);
    
    // Always sort descending (newest entries first)
    const sorted = Array.isArray(logs) ? [...logs].sort((a, b) => {
      const timeA = new Date(a.timestamp || a.createdAt || 0).getTime();
      const timeB = new Date(b.timestamp || b.createdAt || 0).getTime();
      return timeB - timeA;
    }) : [];

    const maxLimit = limit ? Number(limit) : 500;
    const sliced = sorted.slice(0, maxLimit);

    return res.status(200).json({
      success: true,
      totalCount: sorted.length,
      count: sliced.length,
      data: sliced
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve security audit logs.'
    });
  }
};

export const getAuditSummary = async (req, res) => {
  try {
    const all = await AuditLog.find();
    const total = all.length;
    const allowed = all.filter(l => l.status === 'ALLOWED').length;
    const denied = all.filter(l => l.status === 'DENIED').length;
    const horizontalBlocks = all.filter(l => l.action === 'HORIZONTAL_PRIVILEGE_ESCALATION_BLOCKED').length;
    const verticalBlocks = all.filter(l => l.action === 'VERTICAL_PRIVILEGE_ESCALATION_BLOCKED').length;
    const unauthAttempts = all.filter(l => l.action === 'UNAUTHENTICATED_ACCESS_ATTEMPT').length;
    const expiredSessions = all.filter(l => l.action === 'EXPIRED_SESSION_ACCESS_ATTEMPT').length;

    return res.status(200).json({
      success: true,
      summary: {
        totalEvents: total,
        allowedEvents: allowed,
        deniedViolations: denied,
        breakdown: {
          horizontalAccessViolations: horizontalBlocks,
          verticalRoleViolations: verticalBlocks,
          unauthenticatedAttempts: unauthAttempts,
          expiredSessionAttempts: expiredSessions
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve audit summary metrics.'
    });
  }
};

export const clearAuditLogs = async (req, res) => {
  try {
    const { timeframe } = req.body; // '24h', '1m', '1y', 'all'
    const now = new Date();
    let query = {};
    let label = '';

    if (timeframe === '24h') {
      const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      query = { timestamp: { $gte: cutoff } };
      label = 'last 24 hours';
    } else if (timeframe === '1m') {
      const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      query = { timestamp: { $gte: cutoff } };
      label = 'last 1 month';
    } else if (timeframe === '1y') {
      const cutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      query = { timestamp: { $gte: cutoff } };
      label = 'last 1 year';
    } else if (timeframe === 'all') {
      query = {};
      label = 'all historical records';
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid timeframe. Please specify '24h', '1m', '1y', or 'all'."
      });
    }

    const deleteResult = await AuditLog.deleteMany(query);
    const count = deleteResult.deletedCount || 0;

    // Record the audit purge action itself for compliance and forensic visibility
    await logAuditEvent({
      req,
      action: 'SECURITY_AUDIT_LOGS_PURGED',
      resource: '/api/audit/clear',
      status: 'ALLOWED',
      statusCode: 200,
      reason: `Administrator '${req.user?.name || 'Admin'}' cleared ${count} audit entries (${label})`
    });

    return res.status(200).json({
      success: true,
      message: `Successfully cleared ${count} audit log entries for ${label}.`,
      deletedCount: count,
      timeframe
    });
  } catch (error) {
    console.error('Error clearing audit logs:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while clearing audit logs.'
    });
  }
};

