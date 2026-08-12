import { Router } from 'express';
import { getTopArtists } from '../controller/topArtistController.js';

const router = Router();

router.get('/', getTopArtists);

export default router;
