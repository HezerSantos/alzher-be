import rateLimit from "express-rate-limit";
import throwError from "../../helpers/errorHelper";

const globalLimiter = rateLimit({
    windowMs: 1000 * 60,
    max: 50,
    handler: (req, res, next) => {
        throwError("Global Limit", 429, {msg: "Global Limit", code: "INVALID_GLOBAL_LIMIT"})
    }
})

export default globalLimiter