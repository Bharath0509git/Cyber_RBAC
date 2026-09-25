import express from 'express';
import { getAuditLogs, getAuditSummary, clearAuditLogs } from '../controllers/auditController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/rbacMiddleware.js';

const router = express.Router();

// Security audit logs are confidential and restricted strictly to administrators
router.use(authenticateUser);
router.use(authorize('admin'));

router.get('/', getAuditLogs);
router.get('/logs', getAuditLogs);
router.get('/summary', getAuditSummary);
router.post('/clear', clearAuditLogs);
router.delete('/clear', clearAuditLogs);

export default router;
