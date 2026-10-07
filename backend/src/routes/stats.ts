import {Router} from "express";
import {getLibrarySummary, getTimeCapsule, getEraHistory} from "../controllers/statsController.js";

const router = Router();

router.get('/', getLibrarySummary);
router.get('/time-capsule', getTimeCapsule);
router.get('/time-capsule/history', getEraHistory);

export default router;