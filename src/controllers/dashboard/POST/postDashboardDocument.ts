import axios from "axios";
import FormData from "form-data";
import { RequestHandler } from "express";

const postDashboardDocument: RequestHandler = async(req, res, next) => {
    try{
        const files = req.files as Express.Multer.File[]

        const formData = new FormData()

        files?.forEach((file) => {
            formData.append('files', file.buffer, file.originalname)
        })
        const response = await axios.post("http://localhost:5000/dashboard/scan/predict",
            formData,
            {
                headers: formData.getHeaders()
            }
        )
        
        console.log(response)
        console.log(files)

        res.end()
    } catch (error){
        next(error)
    }
}

export default postDashboardDocument