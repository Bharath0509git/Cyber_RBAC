import { StudentProfile, Mark, Attendance } from '../models/index.js';
import { logAuditEvent } from '../middleware/auditLogger.js';

export const getStudentProfile = async (req, res) => {
  try {
    const studentProfile = req.studentProfile || await StudentProfile.findOne({
      $or: [
        { _id: req.params.studentId },
        { userId: req.params.studentId },
        { registerNumber: req.params.studentId.toUpperCase() }
      ]
    });

    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found.'
      });
    }

    await logAuditEvent({
      req,
      action: 'VIEW_OWN_PROFILE',
      resource: req.originalUrl,
      status: 'ALLOWED',
      statusCode: 200,
      reason: `Authorized profile access for student register number: ${studentProfile.registerNumber}`
    });

    return res.status(200).json({
      success: true,
      data: studentProfile
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve student profile.'
    });
  }
};

export const getStudentMarks = async (req, res) => {
  try {
    const studentProfile = req.studentProfile || await StudentProfile.findOne({
      $or: [
        { _id: req.params.studentId },
        { userId: req.params.studentId },
        { registerNumber: req.params.studentId.toUpperCase() }
      ]
    });

    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found.'
      });
    }

    const marks = await Mark.find({
      $or: [
        { studentId: studentProfile._id },
        { studentId: studentProfile.userId },
        { studentRegisterNumber: studentProfile.registerNumber }
      ]
    });

    await logAuditEvent({
      req,
      action: 'VIEW_OWN_MARKS',
      resource: req.originalUrl,
      status: 'ALLOWED',
      statusCode: 200,
      reason: `Marks retrieved for student register number: ${studentProfile.registerNumber}`
    });

    return res.status(200).json({
      success: true,
      student: {
        registerNumber: studentProfile.registerNumber,
        name: studentProfile.name,
        department: studentProfile.department,
        semester: studentProfile.semester
      },
      marks
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch student marks records.'
    });
  }
};

export const getStudentAttendance = async (req, res) => {
  try {
    const studentProfile = req.studentProfile || await StudentProfile.findOne({
      $or: [
        { _id: req.params.studentId },
        { userId: req.params.studentId },
        { registerNumber: req.params.studentId.toUpperCase() }
      ]
    });

    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found.'
      });
    }

    const attendanceRecords = await Attendance.find({
      $or: [
        { studentId: studentProfile._id },
        { studentId: studentProfile.userId },
        { studentRegisterNumber: studentProfile.registerNumber }
      ]
    });

    // Compute overall percentage
    let totalHours = 0;
    let attendedHours = 0;
    attendanceRecords.forEach(att => {
      totalHours += att.totalHours || 0;
      attendedHours += att.attendedHours || 0;
    });

    const overallPercentage = totalHours > 0 ? Math.round((attendedHours / totalHours) * 100) : 100;

    await logAuditEvent({
      req,
      action: 'VIEW_OWN_ATTENDANCE',
      resource: req.originalUrl,
      status: 'ALLOWED',
      statusCode: 200,
      reason: `Attendance retrieved for student register number: ${studentProfile.registerNumber}`
    });

    return res.status(200).json({
      success: true,
      student: {
        registerNumber: studentProfile.registerNumber,
        name: studentProfile.name
      },
      overallPercentage,
      status: overallPercentage >= 75 ? 'Eligible' : 'Attendance Shortage Warning',
      attendance: attendanceRecords
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve attendance records.'
    });
  }
};

export const getAcademicSummary = async (req, res) => {
  try {
    const studentProfile = req.studentProfile || await StudentProfile.findOne({
      $or: [
        { _id: req.params.studentId },
        { userId: req.params.studentId },
        { registerNumber: req.params.studentId.toUpperCase() }
      ]
    });

    if (!studentProfile) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const marks = await Mark.find({ studentRegisterNumber: studentProfile.registerNumber });
    const attendance = await Attendance.find({ studentRegisterNumber: studentProfile.registerNumber });

    const totalMarks = marks.reduce((acc, m) => acc + (m.total || 0), 0);
    const avgMarks = marks.length > 0 ? Math.round(totalMarks / marks.length) : 0;

    return res.status(200).json({
      success: true,
      profile: studentProfile,
      totalSubjects: marks.length,
      averageScore: avgMarks,
      marksCount: marks.length,
      attendanceCount: attendance.length
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve summary.' });
  }
};
