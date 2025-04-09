import express from 'express';
import { createTask, getTasks, updateTaskStatus } from '../controllers/taskController';
import { authenticateToken } from '../middleware/auth';
import { isAdmin } from '../middleware/roleCheck';

const router = express.Router();

// Get tasks (filtered by role - admins see all, employees see assigned)
router.get('/', authenticateToken, getTasks);

// Create task (both admin and employees can create)
router.post('/', authenticateToken, createTask);

// Update task status (both admin and assigned employee can update)
router.patch('/:taskId/status', authenticateToken, updateTaskStatus);

export default router; 