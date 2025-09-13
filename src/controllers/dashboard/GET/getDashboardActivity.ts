import { RequestHandler } from "express";

const getDashboardActivity: RequestHandler = async(req, res, next) => {
    try{

        res.end()
    } catch(error){
        next(error)
    }
}

export default getDashboardActivity