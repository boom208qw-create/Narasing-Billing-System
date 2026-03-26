import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me  (protected)
router.get('/me', authMiddleware, getMe);

export default router;
