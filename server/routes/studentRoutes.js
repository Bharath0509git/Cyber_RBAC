import express from 'express';
import { 
  getStudentProfile, 
  getStudentMarks, 
  getStudentAttendance, 
  getAcademicSummary 
} from '../controllers/studentController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { verifyStudentOwnership } from '../middleware/ownershipMiddleware.js';

const router = express.Router();

// All student routes require authentication AND ownership verification
// (Student A can only view Student A's records; cross-user access returns 403 Forbidden)
router.get('/:studentId/profile', authenticateUser, verifyStudentOwnership, getStudentProfile);
router.get('/:studentId/marks', authenticateUser, verifyStudentOwnership, getStudentMarks);
router.get('/:studentId/attendance', authenticateUser, verifyStudentOwnership, getStudentAttendance);
router.get('/:studentId/summary', authenticateUser, verifyStudentOwnership, getAcademicSummary);

export default router;
