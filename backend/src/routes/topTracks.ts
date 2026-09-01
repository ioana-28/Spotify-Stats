import { Router } from 'express';
import { getTopTracks } from '../controllers/topTrackController.js';

const router = Router();

router.get('/', getTopTracks);

export default router;
