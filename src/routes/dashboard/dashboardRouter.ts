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
import dashboardLimiter from "../../ratelimiters/dashboard/dashboardLimiter";

const storage = multer.memoryStorage();
const upload = multer({ 
    storage ,
    limits: {
        fileSize: 2 * 1024 * 1024,
        files: 10
    }
});

const dashboardRouter = Router()

dashboardRouter.get("/overview", dashboardLimiter(25), getDashboardOverview)
dashboardRouter.get("/analytics", dashboardLimiter(25), getDashboardAnalytics)
dashboardRouter.get("/activity", dashboardLimiter(25), getDashboardActivity)
dashboardRouter.delete("/activity/:id", dashboardLimiter(25), deleteDashboardActivityItem)
dashboardRouter.patch("/activity/:id", dashboardLimiter(25), patchDashboardActivityItem)
dashboardRouter.post("/scan", dashboardLimiter(10), upload.array('files'), postDashboardDocument)

dashboardRouter.get("/settings", dashboardLimiter(25), getSettingsData)
dashboardRouter.patch("/settings/password", dashboardLimiter(25), patchUserPassword)
dashboardRouter.patch("/settings/email", dashboardLimiter(25), patchUserEmail)

export default dashboardRouter