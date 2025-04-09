import express from 'express';
import { getUsers, updateUserRole } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';
import { isSuperAdmin } from '../middleware/roleCheck';

const router = express.Router();

// Get all users (protected, super admin only)
router.get('/', authenticateToken, isSuperAdmin, getUsers);

// Update user role (protected, super admin only)
router.patch('/:userId/role', authenticateToken, isSuperAdmin, updateUserRole);

export default router; 