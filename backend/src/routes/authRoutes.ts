import express from 'express';
import { register, login, logout, getCurrentUser, getEmployees } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { isAdmin } from '../middleware/roleCheck';
import { validateLogin, validateRegistration } from '../middleware/validation';

const router = express.Router();

// Public routes
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);

// Protected routes
router.use(authenticateToken);
router.post('/logout', logout);
router.get('/me', getCurrentUser);
router.get('/employees', isAdmin, getEmployees);

export default router; 