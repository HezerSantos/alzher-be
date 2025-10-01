import { Router } from "express";
import multer from 'multer'
import postDashboardDocument from "../../controllers/dashboard/POST/postDashboardDocument";
import getDashboardOverview from "../../controllers/dashboard/GET/getDashboardOverview";
import getDashboardAnalytics from "../../controllers/dashboard/GET/getDashboardAnalytics";
import getDashboardActivity from "../../controllers/dashboard/GET/getDashboardActivity";
import deleteDashboardActivityItem from "../../controllers/dashboard/DELETE/deleteDashboardActivityItem";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const dashboardRouter = Router()

dashboardRouter.get("/overview", getDashboardOverview)
dashboardRouter.get("/analytics", getDashboardAnalytics)
dashboardRouter.get("/activity", getDashboardActivity)
dashboardRouter.delete("/activity", deleteDashboardActivityItem)
dashboardRouter.post("/scan", upload.array('files'), postDashboardDocument)

export default dashboardRouter