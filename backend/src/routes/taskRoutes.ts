import express from 'express';
import { createTask, getTasks } from '../controllers/taskController';
import { authenticateToken } from '../middleware/auth';
import { isAdmin } from '../middleware/roleCheck';

const router = express.Router();

// Get tasks (filtered by role - admins see all, employees see assigned)
router.get('/', authenticateToken, getTasks);

// Create task (admin only)
router.post('/', authenticateToken, isAdmin, createTask);

export default router; 