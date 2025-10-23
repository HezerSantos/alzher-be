import rateLimit from "express-rate-limit";
import throwError from "../../helpers/errorHelper";

const dashboardLimiter = (max: number, store?: any) => {
    return  rateLimit({
        windowMs: 60 * 1000,
        max: max,
        handler: (req, res, next) => {
            throwError("Rate Limit", 429, {msg: "Limit Exceeded", code: "INVALID_DASHBOARD_LIMIT"})
        }
    })
}

export default dashboardLimiter