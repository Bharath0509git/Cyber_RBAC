import express from 'express';
import { 
  getAssignedStudents, 
  updateStudentMarks, 
  updateStudentAttendance,
  getStudentAcademicDetails
} from '../controllers/facultyController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/rbacMiddleware.js';

const router = express.Router();

// Faculty routes require valid login AND either 'faculty' or 'admin' role
router.use(authenticateUser);
router.use(authorize('faculty', 'admin'));

router.get('/students', getAssignedStudents);
router.get('/students/:studentRegisterNumber/academic', getStudentAcademicDetails);
router.put('/marks/:markId', updateStudentMarks);
router.put('/attendance/:attendanceId', updateStudentAttendance);

export default router;
