import { User, StudentProfile, FacultyProfile } from '../models/index.js';
import { generateToken, generateExpiredToken } from '../utils/jwtHelper.js';
import { logAuditEvent } from '../middleware/auditLogger.js';

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both email and password.'
    });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      await logAuditEvent({
        req,
        action: 'AUTH_LOGIN_FAILED',
        resource: '/api/auth/login',
        status: 'DENIED',
        statusCode: 401,
        reason: `Login failed: Non-existent email '${email}'`
      });

      return res.status(401).json({
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      await logAuditEvent({
        req: { ...req, user: { id: user._id, name: user.name, role: user.role } },
        action: 'AUTH_LOGIN_FAILED',
        resource: '/api/auth/login',
        status: 'DENIED',
        statusCode: 401,
        reason: 'Login failed: Incorrect password provided.'
      });

      return res.status(401).json({
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.'
      });
    }

    if (user.isActive === false) {
      await logAuditEvent({
        req: { ...req, user },
        action: 'DEACTIVATED_LOGIN_BLOCKED',
        resource: '/api/auth/login',
        status: 'DENIED',
        statusCode: 403,
        reason: 'Account disabled by administrator.'
      });

      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_DISABLED',
        message: 'Your account is deactivated. Please contact the administrator.'
      });
    }

    // Update last login
    await User.findByIdAndUpdate(user._id || user.id, { lastLogin: new Date() });

    // Generate JWT Token
    const token = generateToken(user);

    // Fetch related profile if student or faculty
    let profileData = null;
    if (user.role === 'student') {
      profileData = await StudentProfile.findOne({ userId: user._id || user.id });
    } else if (user.role === 'faculty') {
      profileData = await FacultyProfile.findOne({ userId: user._id || user.id });
    }

    await logAuditEvent({
      req: { ...req, user: { id: user._id, name: user.name, role: user.role } },
      action: 'AUTH_LOGIN_SUCCESS',
      resource: '/api/auth/login',
      status: 'ALLOWED',
      statusCode: 200,
      reason: `User logged in successfully with role '${user.role}'`
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: profileData
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    let profile = null;
    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ userId: user._id || user.id });
    } else if (user.role === 'faculty') {
      profile = await FacultyProfile.findOne({ userId: user._id || user.id });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        profile
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving current session details.'
    });
  }
};

export const logout = async (req, res) => {
  await logAuditEvent({
    req,
    action: 'AUTH_LOGOUT',
    resource: '/api/auth/logout',
    status: 'ALLOWED',
    statusCode: 200,
    reason: `User '${req.user?.name}' logged out voluntarily`
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully. Client session destroyed.'
  });
};

// Generates an expired token for TC-05 verification
export const getExpiredTestToken = async (req, res) => {
  const { email } = req.query;
  const user = await User.findOne({ email: email || 'student1@college.local' });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const expiredToken = generateExpiredToken(user);
  return res.status(200).json({
    success: true,
    message: 'Expired token generated for TC-05 security validation testing',
    token: expiredToken
  });
};
