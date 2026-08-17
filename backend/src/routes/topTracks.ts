import { Router } from 'express';
import { getTopTracks } from '../controller/topTrackController.js';

const router = Router();

router.get('/', getTopTracks);

export default router;
