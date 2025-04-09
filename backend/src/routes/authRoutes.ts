import express from 'express';
import { register, login, logout, getCurrentUser, getEmployees } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { isAdmin } from '../middleware/roleCheck';
import { validateLogin, validateRegistration } from '../middleware/validation';

const router = express.Router();

// Public routes
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/logout', logout);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);
router.get('/employees', authenticateToken, isAdmin, getEmployees);

export default router; 