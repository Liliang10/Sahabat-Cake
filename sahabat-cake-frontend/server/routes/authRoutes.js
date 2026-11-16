import { Router } from 'express';
import { login, logout, getMe, verifyToken } from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// Endpoint autentikasi admin
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', auth, getMe);
router.get('/verify', auth, verifyToken);

export default router;
