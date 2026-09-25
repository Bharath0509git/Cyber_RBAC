import express from 'express';
import { 
  getAllUsers, 
  createUser, 
  toggleUserStatus, 
  updateUserRole, 
  getSystemStats 
} from '../controllers/adminController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/rbacMiddleware.js';

const router = express.Router();

// Administrator routes require valid login AND strictly 'admin' role
// Any access attempt by student or faculty results in 403 Forbidden and audit log
router.use(authenticateUser);
router.use(authorize('admin'));

router.get('/users', getAllUsers);
router.post('/users', createUser);
router.patch('/users/:userId/status', toggleUserStatus);
router.patch('/users/:userId/role', updateUserRole);
router.get('/stats', getSystemStats);

export default router;
