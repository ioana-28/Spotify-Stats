import { Router } from 'express';
import { login, callback, establishSession, logout } from '../controllers/authController.js';

const router = Router();

router.get('/login', login);
router.get('/callback', callback);
router.get('/session', establishSession);
router.post('/logout', logout);

export default router;