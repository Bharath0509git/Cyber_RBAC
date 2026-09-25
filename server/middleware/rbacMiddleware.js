import { logAuditEvent } from './auditLogger.js';

/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces vertical access control by validating that the authenticated user's role
 * matches the allowed roles configured for the route.
 * 
 * @param  {...string|Array} allowedRoles - List or array of roles permitted to access endpoint
 */
export const authorize = (...allowedRoles) => {
  const roles = allowedRoles.flat();

  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        code: 'AUTH_REQUIRED',
        message: 'Authentication required before checking permissions.'
      });
    }

    const userRole = req.user.role;

    if (!roles.includes(userRole)) {
      // TC-03 & TC-07: Vertical Access Control Violation Blocked
      await logAuditEvent({
        req,
        action: 'VERTICAL_PRIVILEGE_ESCALATION_BLOCKED',
        resource: req.originalUrl,
        status: 'DENIED',
        statusCode: 403,
        reason: `RBAC Violation: Role '${userRole}' is not authorized to access endpoint requiring [${roles.join(', ')}]`
      });

      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN_ROLE',
        message: `Access denied: Role '${userRole}' is not permitted to access this resource. Requires [${roles.join(', ')}].`
      });
    }

    next();
  };
};
