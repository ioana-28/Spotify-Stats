import {Router} from "express";
import {getDashboardData, getCurrentlyPlayingTrack} from "../controllers/dashboardController.js";

const router = Router();

router.get('/', getDashboardData);
router.get('/currently-playing', getCurrentlyPlayingTrack);

export default router;