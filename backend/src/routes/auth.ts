import { Router } from 'express';
import { login, callback, logout, getMe } from '../controllers/authController.js';

const router = Router();

router.get('/login', login);
router.get('/callback', callback);
router.post('/logout', logout);
router.get('/me', getMe);   

export default router;