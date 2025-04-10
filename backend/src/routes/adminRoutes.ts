import { Router } from 'express';
import { getEmployeeWorkStatus, getProductivityMetrics, getEmployeeTimeLogs } from '../controllers/adminController';
import { isAuthenticated } from '../middleware/auth';
import { isAdmin } from '../middleware/roleCheck';

const router = Router();

// Admin dashboard routes - all protected by authentication and admin role check
router.get('/employee-status', isAuthenticated, isAdmin, getEmployeeWorkStatus);
router.get('/productivity-metrics', isAuthenticated, isAdmin, getProductivityMetrics);
router.get('/employee-time-logs', isAuthenticated, isAdmin, getEmployeeTimeLogs);

export default router; 