import { Router } from 'express';
import { getTopArtists } from '../controller/statsController.js';

const router = Router();

router.get('/top-artists', getTopArtists);

export default router;