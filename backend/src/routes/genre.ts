import {Router} from "express";
import {getGenres} from "../controllers/genreController.js";

const router = Router();

router.get('/', getGenres);

export default router;