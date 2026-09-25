import { verifyToken } from '../utils/jwtHelper.js';
import { User } from '../models/index.js';
import { logAuditEvent } from './auditLogger.js';

export const authenticateUser = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // TC-04: Protected URL without login -> Denied (401 Unauthorized)
  if (!token) {
    await logAuditEvent({
      req,
      action: 'UNAUTHENTICATED_ACCESS_ATTEMPT',
      resource: req.originalUrl,
      status: 'DENIED',
      statusCode: 401,
      reason: 'No bearer authorization token provided in request header'
    });

    return res.status(401).json({
      success: false,
      code: 'AUTH_TOKEN_MISSING',
      message: 'Access denied: Authentication token required to access this resource.'
    });
  }

  // TC-05: Expired JWT -> Re-authentication required (401 Unauthorized)
  const verification = verifyToken(token);

  if (!verification.valid) {
    if (verification.expired) {
      await logAuditEvent({
        req: { ...req, user: { role: 'EXPIRED_SESSION' } },
        action: 'EXPIRED_SESSION_ACCESS_ATTEMPT',
        resource: req.originalUrl,
        status: 'DENIED',
        statusCode: 401,
        reason: 'JWT expiration timestamp exceeded. Re-authentication required.'
      });

      return res.status(401).json({
        success: false,
        code: 'TOKEN_EXPIRED',
        message: 'Session has expired. Re-authentication required.'
      });
    }

    await logAuditEvent({
      req,
      action: 'MALFORMED_TOKEN_ATTEMPT',
      resource: req.originalUrl,
      status: 'DENIED',
      statusCode: 401,
      reason: 'Cryptographic signature mismatch or corrupted token.'
    });

    return res.status(401).json({
      success: false,
      code: 'INVALID_TOKEN',
      message: 'Invalid or forged authentication token.'
    });
  }

  // Token is cryptographically valid, now verify user existence and active status in DB
  try {
    const user = await User.findById(verification.decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'Account associated with token no longer exists.'
      });
    }

    if (user.isActive === false) {
      await logAuditEvent({
        req: { ...req, user },
        action: 'DEACTIVATED_USER_ACCESS_BLOCKED',
        resource: req.originalUrl,
        status: 'DENIED',
        statusCode: 403,
        reason: 'Administrative deactivation active on this user account'
      });

      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_DISABLED',
        message: 'Your account has been deactivated. Please contact the administrator.'
      });
    }

    // Attach verified user payload to request
    req.user = {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error verifying user authorization identity.'
    });
  }
};
