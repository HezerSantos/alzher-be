import rateLimit from "express-rate-limit";
import throwError from "../../../helpers/errorHelper";

const getDashboardOverviewLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 2,
    handler: (req, res, next) => {
        throwError("Rate Limit", 429, {msg: "Limit Exceeded", code: "INVALID_DASHBOARD_LIMIT"})
    }
})

export default getDashboardOverviewLimiter