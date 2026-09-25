import { StudentProfile, Mark, Attendance } from '../models/index.js';
import { logAuditEvent } from '../middleware/auditLogger.js';

export const getAssignedStudents = async (req, res) => {
  try {
    // Faculty can view students in their department / assigned
    const students = await StudentProfile.find();

    await logAuditEvent({
      req,
      action: 'VIEW_ASSIGNED_STUDENTS',
      resource: '/api/faculty/students',
      status: 'ALLOWED',
      statusCode: 200,
      reason: `Faculty '${req.user.name}' retrieved assigned student cohort`
    });

    return res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve students list.'
    });
  }
};

export const updateStudentMarks = async (req, res) => {
  const { markId } = req.params;
  const { internalMark, semesterMark } = req.body;

  try {
    const markRecord = await Mark.findById(markId);
    if (!markRecord) {
      return res.status(404).json({
        success: false,
        message: 'Mark record not found.'
      });
    }

    const internal = internalMark !== undefined ? Number(internalMark) : markRecord.internalMark;
    const semester = semesterMark !== undefined ? Number(semesterMark) : markRecord.semesterMark;
    const total = internal + semester;

    let grade = 'RA';
    if (total >= 90) grade = 'O';
    else if (total >= 80) grade = 'A+';
    else if (total >= 70) grade = 'A';
    else if (total >= 60) grade = 'B+';
    else if (total >= 50) grade = 'B';

    const updated = await Mark.findByIdAndUpdate(markId, {
      internalMark: internal,
      semesterMark: semester,
      total,
      grade,
      updatedBy: req.user.id,
      updatedAt: new Date()
    }, { new: true });

    await logAuditEvent({
      req,
      action: 'UPDATE_STUDENT_MARKS',
      resource: `/api/faculty/marks/${markId}`,
      status: 'ALLOWED',
      statusCode: 200,
      reason: `Faculty '${req.user.name}' updated marks for ${markRecord.studentRegisterNumber} in ${markRecord.subjectCode} to ${total} (${grade})`
    });

    return res.status(200).json({
      success: true,
      message: 'Marks updated successfully.',
      data: updated
    });
  } catch (error) {
    console.error('[UPDATE STUDENT MARKS ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update student marks.',
      error: error.message
    });
  }
};

export const updateStudentAttendance = async (req, res) => {
  const { attendanceId } = req.params;
  const { totalHours, attendedHours } = req.body;

  try {
    const record = await Attendance.findById(attendanceId);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found.'
      });
    }

    const tot = totalHours !== undefined ? Number(totalHours) : record.totalHours;
    const att = attendedHours !== undefined ? Number(attendedHours) : record.attendedHours;
    const pct = Math.round((att / tot) * 100);

    let status = 'Eligible (Good)';
    if (pct < 65) status = 'Critical Detained';
    else if (pct < 75) status = 'Shortage Warning';

    const updated = await Attendance.findByIdAndUpdate(attendanceId, {
      totalHours: tot,
      attendedHours: att,
      percentage: pct,
      status,
      updatedBy: req.user.id,
      updatedAt: new Date()
    }, { new: true });

    await logAuditEvent({
      req,
      action: 'UPDATE_STUDENT_ATTENDANCE',
      resource: `/api/faculty/attendance/${attendanceId}`,
      status: 'ALLOWED',
      statusCode: 200,
      reason: `Faculty '${req.user.name}' updated attendance for ${record.studentRegisterNumber} in ${record.subjectCode} (${att}/${tot} = ${pct}%)`
    });

    return res.status(200).json({
      success: true,
      message: 'Attendance record updated successfully.',
      data: updated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update attendance record.'
    });
  }
};

export const getStudentAcademicDetails = async (req, res) => {
  const { studentRegisterNumber } = req.params;

  try {
    const marks = await Mark.find({ studentRegisterNumber });
    const attendance = await Attendance.find({ studentRegisterNumber });

    return res.status(200).json({
      success: true,
      studentRegisterNumber,
      marks,
      attendance
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch student academic details.'
    });
  }
};
