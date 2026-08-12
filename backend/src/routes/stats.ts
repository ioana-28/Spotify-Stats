import { Router } from 'express';
import { getTopArtists } from '../controller/statsController.js';
import { getTopTracks } from '../controller/statsController.js';

const router = Router();

router.get('/top-artists', getTopArtists);
router.get('/top-tracks', getTopTracks);

export default router;