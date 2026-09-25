import express from 'express';
import { login, getMe, logout, getExpiredTestToken } from '../controllers/authController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.get('/me', authenticateUser, getMe);
router.post('/logout', authenticateUser, logout);
router.get('/expired-test-token', getExpiredTestToken);

export default router;
