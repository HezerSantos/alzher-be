import { RequestHandler } from "express";

const getDashboardOverview: RequestHandler = async(req, res, next) => {
    try{
        
        res.end()

    } catch(error){
        next(error)
    }
}

export default getDashboardOverview