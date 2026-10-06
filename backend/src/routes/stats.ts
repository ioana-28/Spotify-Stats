import {Router} from "express";
import {getLibrarySummary} from "../controllers/statsController.js";

const router = Router();

router.get('/', getLibrarySummary);

export default router;