import { Router } from "express";
import postDashboardDocument from "../../controllers/dashboard/POST/postDashboardDocument";

const dashboardRouter = Router()


dashboardRouter.post("/scan", postDashboardDocument)

export default dashboardRouter