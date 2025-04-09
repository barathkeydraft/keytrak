import express from 'express';
import { startTimeLog, stopTimeLog, getCurrentTimeLog, getDailyLogs, updateTimeLogNotes } from '../controllers/timeLogController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Time tracking routes
router.post('/start', startTimeLog);
router.post('/stop', stopTimeLog);
router.get('/current', getCurrentTimeLog);
router.get('/daily', getDailyLogs);
router.patch('/:timeLogId/notes', updateTimeLogNotes);

export default router; 