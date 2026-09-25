import { StudentProfile } from '../models/index.js';
import { logAuditEvent } from './auditLogger.js';

/**
 * Enforces Horizontal Access Control (Ownership Check)
 * Prevents Student A from accessing Student B's marks, attendance, or profile.
 * Admins always have oversight access.
 * Faculty have access based on academic authorization.
 */
export const verifyStudentOwnership = async (req, res, next) => {
  const user = req.user;
  const targetStudentId = req.params.studentId || req.params.id;

  // Administrators have global management oversight
  if (user.role === 'admin') {
    return next();
  }

  // Faculty have oversight for marks/attendance grading
  if (user.role === 'faculty') {
    return next();
  }

  // If user is a student, verify that targetStudentId strictly matches their own identity
  if (user.role === 'student') {
    try {
      const studentProfile = await StudentProfile.findOne({ userId: user.id });

      if (!studentProfile) {
        return res.status(404).json({
          success: false,
          code: 'PROFILE_NOT_FOUND',
          message: 'Student profile not found for authenticated account.'
        });
      }

      // Check if target param matches either:
      // 1. User ID
      // 2. StudentProfile _id
      // 3. Register Number (e.g., STU001)
      const isOwner = (
        targetStudentId === String(user.id) ||
        targetStudentId === String(studentProfile._id) ||
        targetStudentId.toUpperCase() === String(studentProfile.registerNumber).toUpperCase() ||
        targetStudentId === 'me'
      );

      if (!isOwner) {
        // TC-02: Horizontal Privilege Escalation Blocked
        await logAuditEvent({
          req,
          action: 'HORIZONTAL_PRIVILEGE_ESCALATION_BLOCKED',
          resource: req.originalUrl,
          status: 'DENIED',
          statusCode: 403,
          reason: `Student ${studentProfile.registerNumber} (${user.email}) attempted unauthorized access to peer student record '${targetStudentId}'`
        });

        return res.status(403).json({
          success: false,
          code: 'FORBIDDEN_OWNERSHIP',
          message: 'Access denied: Cross-user access prohibited. You are only permitted to access your own student records.'
        });
      }

      // Ownership confirmed: attach profile to request for quick controller use
      req.studentProfile = studentProfile;
      return next();
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error verifying data ownership.'
      });
    }
  }

  // Deny-by-default for any unrecognized role
  return res.status(403).json({
    success: false,
    code: 'ACCESS_DENIED',
    message: 'Access denied: Insufficient privileges.'
  });
};
