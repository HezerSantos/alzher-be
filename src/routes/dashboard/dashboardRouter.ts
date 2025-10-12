import { Router } from "express";
import multer from 'multer'
import postDashboardDocument from "../../controllers/dashboard/POST/postDashboardDocument";
import getDashboardOverview from "../../controllers/dashboard/GET/getDashboardOverview";
import getDashboardAnalytics from "../../controllers/dashboard/GET/getDashboardAnalytics";
import getDashboardActivity from "../../controllers/dashboard/GET/getDashboardActivity";
import deleteDashboardActivityItem from "../../controllers/dashboard/DELETE/deleteDashboardActivityItem";
import patchDashboardActivityItem from "../../controllers/dashboard/PATCH/patchDashboardActivityItem";
import getSettingsData from "../../controllers/dashboard/GET/getSettingsData";
import patchUserPassword from "../../controllers/dashboard/PATCH/patchUserPassword";
import patchUserEmail from "../../controllers/dashboard/PATCH/patchUserEmail";
import getDashboardOverviewLimiter from "../../ratelimiters/dashboard/GET/getDashboardOverviewLimiter";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const dashboardRouter = Router()

dashboardRouter.get("/overview", getDashboardOverviewLimiter, getDashboardOverview)
dashboardRouter.get("/analytics", getDashboardAnalytics)
dashboardRouter.get("/activity", getDashboardActivity)
dashboardRouter.delete("/activity/:id", deleteDashboardActivityItem)
dashboardRouter.patch("/activity/:id", patchDashboardActivityItem)
dashboardRouter.post("/scan", upload.array('files'), postDashboardDocument)

dashboardRouter.get("/settings", getSettingsData)
dashboardRouter.patch("/settings/password", patchUserPassword)
dashboardRouter.patch("/settings/email", patchUserEmail)

export default dashboardRouter