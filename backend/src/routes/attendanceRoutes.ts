import express from 'express';
import { attendanceController } from '../controllers/attendanceController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Protected routes - require authentication
router.use(authenticateToken);

// Mark attendance (login/logout)
router.post('/', attendanceController.markAttendance);

// Get attendance history
router.get('/history', attendanceController.getAttendanceHistory);

// Get latest attendance
router.get('/latest', attendanceController.getLatestAttendance);

export default router; 