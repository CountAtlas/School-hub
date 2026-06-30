import { Router, type IRouter } from "express";
import healthRouter from "./health";
import submissionsRouter from "./submissions";
import adminRouter from "./admin";
import dailyUpdatesRouter from "./daily-updates";
import examsRouter from "./exams";
import announcementsRouter from "./announcements";

const router: IRouter = Router();

router.use(healthRouter);
router.use(submissionsRouter);
router.use(adminRouter);
router.use(dailyUpdatesRouter);
router.use(examsRouter);
router.use(announcementsRouter);

export default router;
