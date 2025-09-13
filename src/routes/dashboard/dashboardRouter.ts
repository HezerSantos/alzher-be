import { Router } from "express";
import postDashboardDocument from "../../controllers/dashboard/POST/postDashboardDocument";
import getDashboardOverview from "../../controllers/dashboard/GET/getDashboardOverview";
import getDashboardAnalytics from "../../controllers/dashboard/GET/getDashboardAnalytics";
import getDashboardActivity from "../../controllers/dashboard/GET/getDashboardActivity";

const dashboardRouter = Router()

dashboardRouter.get("/overview", getDashboardOverview)
dashboardRouter.get("/analytics", getDashboardAnalytics)
dashboardRouter.get("/activity", getDashboardActivity)
dashboardRouter.post("/scan", postDashboardDocument)

export default dashboardRouter