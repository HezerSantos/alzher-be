import { RequestHandler } from "express";

const getDashboardAnalytics: RequestHandler = async(req, res, next) => {
    try{
        res.end()
    } catch(error){
        next(error)
    }
}

export default getDashboardAnalytics