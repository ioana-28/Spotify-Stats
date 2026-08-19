import {Router} from "express";
import {getDashboardData} from "../controller/dashboardController.js";

const router = Router();

router.get('/', getDashboardData);

export default router;