import { RequestHandler } from "express";

const postDashboardDocument: RequestHandler = async(req, res, next) => {
    try{
        const files = req.files
        console.log(files)

        res.end()
    } catch (error){
        next(error)
    }
}

export default postDashboardDocument