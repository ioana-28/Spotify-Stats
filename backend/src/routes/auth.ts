import { Router } from 'express';
import { login, callback, establishSession, logout, getMe } from '../controllers/authController.js';

const router = Router();

router.get('/login', login);
router.get('/callback', callback);
router.get('/session', establishSession);
router.post('/logout', logout);
router.get('/me', getMe);   

export default router;