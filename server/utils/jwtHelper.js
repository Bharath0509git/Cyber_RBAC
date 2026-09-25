import jwt from 'jsonwebtoken';

const getSecret = () => process.env.JWT_SECRET || 'cyber_rbac_super_secret_jwt_key_2026';
const getDefaultExpiry = () => process.env.JWT_EXPIRES_IN || '15m';

export const generateToken = (user, expiresIn = null) => {
  const payload = {
    id: user._id || user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };

  return jwt.sign(payload, getSecret(), {
    expiresIn: expiresIn || getDefaultExpiry(),
    issuer: 'SecureCollegePortal',
    audience: 'CollegePortalUsers'
  });
};

// Generates an already expired token for TC-05 security testing
export const generateExpiredToken = (user) => {
  const payload = {
    id: user._id || user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    iat: Math.floor(Date.now() / 1000) - 7200 // Issued 2 hours ago
  };

  return jwt.sign(payload, getSecret(), {
    expiresIn: '1s'
  });
};

export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, getSecret(), {
      issuer: 'SecureCollegePortal',
      audience: 'CollegePortalUsers'
    });
    return { valid: true, decoded };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return { valid: false, expired: true, message: 'Session token has expired. Re-authentication required.' };
    }
    return { valid: false, invalid: true, message: 'Invalid or forged authentication token signature.' };
  }
};
