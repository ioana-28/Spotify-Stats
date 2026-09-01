import { Router } from 'express';
import { getTopArtists } from '../controllers/topArtistController.js';

const router = Router();

router.get('/', getTopArtists);

export default router;
