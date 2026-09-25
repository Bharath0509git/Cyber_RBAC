import { AuditLog } from '../models/index.js';

export const logAuditEvent = async ({
  req,
  action,
  resource,
  status = 'ALLOWED',
  statusCode = 200,
  reason = 'Operation executed successfully'
}) => {
  try {
    const user = req?.user || {};
    const ipAddress = req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || '127.0.0.1';
    const userAgent = req?.headers?.['user-agent'] || 'API Client';

    const logEntry = {
      userId: user.id || user._id || 'ANONYMOUS',
      userName: user.name || 'Unauthenticated User',
      role: user.role || 'NONE',
      action,
      resource: resource || req?.originalUrl || req?.url || 'UNKNOWN_RESOURCE',
      method: req?.method || 'N/A',
      status,
      statusCode,
      reason,
      ipAddress: String(ipAddress),
      userAgent: String(userAgent),
      timestamp: new Date()
    };

    await AuditLog.create(logEntry);
  } catch (err) {
    console.error('[AUDIT LOG ERROR] Failed to record audit log:', err.message);
  }
};
