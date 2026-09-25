import { User, StudentProfile, FacultyProfile, Mark, Attendance, AuditLog } from '../models/index.js';
import { logAuditEvent } from '../middleware/auditLogger.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user registry.'
    });
  }
};

export const createUser = async (req, res) => {
  const { name, email, password, role, registerNumber, employeeId, department } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, password, and role are required fields.'
    });
  }

  try {
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.'
      });
    }

    const newUser = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role: role.toLowerCase(),
      isActive: true
    });

    // Create corresponding profile
    if (role === 'student') {
      const reg = registerNumber || `STU${Math.floor(100 + Math.random() * 900)}`;
      await StudentProfile.create({
        userId: newUser._id || newUser.id,
        registerNumber: reg,
        name,
        email: newUser.email,
        department: department || 'Computer Science and Engineering',
        year: 'I Year',
        semester: 1,
        section: 'A'
      });
    } else if (role === 'faculty') {
      const emp = employeeId || `FAC${Math.floor(100 + Math.random() * 900)}`;
      await FacultyProfile.create({
        userId: newUser._id || newUser.id,
        employeeId: emp,
        name,
        email: newUser.email,
        department: department || 'Computer Science and Engineering',
        designation: 'Assistant Professor'
      });
    }

    await logAuditEvent({
      req,
      action: 'ADMIN_CREATE_USER',
      resource: `/api/admin/users/${newUser._id || newUser.id}`,
      status: 'ALLOWED',
      statusCode: 201,
      reason: `Administrator created new user '${email}' with role '${role}'`
    });

    return res.status(201).json({
      success: true,
      message: `User created successfully with role '${role}'`,
      data: {
        id: newUser._id || newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create user account.'
    });
  }
};

export const toggleUserStatus = async (req, res) => {
  const { userId } = req.params;

  try {
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Target user account not found.'
      });
    }

    // Prevent admin from disabling themselves
    if (String(targetUser._id || targetUser.id) === String(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Security policy prohibits an administrator from deactivating their own active account.'
      });
    }

    const updatedStatus = !targetUser.isActive;
    await User.findByIdAndUpdate(userId, { isActive: updatedStatus });

    await logAuditEvent({
      req,
      action: updatedStatus ? 'ADMIN_ENABLE_USER' : 'ADMIN_DISABLE_USER',
      resource: `/api/admin/users/${userId}/status`,
      status: 'ALLOWED',
      statusCode: 200,
      reason: `Administrator set user '${targetUser.email}' active status to ${updatedStatus}`
    });

    return res.status(200).json({
      success: true,
      message: `User account has been ${updatedStatus ? 'activated' : 'deactivated'}.`,
      isActive: updatedStatus
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update user active status.'
    });
  }
};

export const updateUserRole = async (req, res) => {
  const { userId } = req.params;
  const { newRole } = req.body;

  if (!['student', 'faculty', 'admin'].includes(newRole)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role specified. Must be student, faculty, or admin.'
    });
  }

  try {
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const oldRole = targetUser.role;
    await User.findByIdAndUpdate(userId, { role: newRole });

    await logAuditEvent({
      req,
      action: 'ADMIN_UPDATE_ROLE',
      resource: `/api/admin/users/${userId}/role`,
      status: 'ALLOWED',
      statusCode: 200,
      reason: `Administrator changed user '${targetUser.email}' role from '${oldRole}' to '${newRole}'`
    });

    return res.status(200).json({
      success: true,
      message: `User role successfully updated from '${oldRole}' to '${newRole}'.`,
      role: newRole
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update user role.'
    });
  }
};

export const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const studentUsers = await User.countDocuments({ role: 'student' });
    const facultyUsers = await User.countDocuments({ role: 'faculty' });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const totalMarks = await Mark.countDocuments();
    const totalAttendance = await Attendance.countDocuments();
    const totalAuditLogs = await AuditLog.countDocuments();
    const blockedViolations = await AuditLog.countDocuments({ status: 'DENIED' });

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        studentUsers,
        facultyUsers,
        adminUsers,
        totalMarks,
        totalAttendance,
        totalAuditLogs,
        blockedViolations
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate system statistics.'
    });
  }
};
