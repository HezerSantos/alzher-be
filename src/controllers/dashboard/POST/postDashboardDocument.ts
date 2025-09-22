import axios, {AxiosError} from "axios";
import FormData from "form-data";
import { RequestHandler } from "express";
import fileType from 'file-type';
import throwError from "../../../helpers/errorHelper";
import prisma from "../../../config/prisma";

interface Transactons {
    month: string,
    day: number,
    year: number,
    description: string,
    price: number,
    category: string
}



const postDashboardDocument: RequestHandler = async(req, res, next) => {
    try{
        const files = req.files as Express.Multer.File[]
        if(files.length === 0 || !files){
            throwError("No Files Provided", 400, {msg: 'At leas one file must be uploaded', code: "MISSING_REQUIRED_FILE"})
        }

        const formData = new FormData()

        for (const file of files){
            const type = await fileType.fileTypeFromBuffer(file.buffer)
            if(type?.mime !== 'application/pdf' || type?.ext !== "pdf"){
                throwError("Invalid Files", 400, {msg: 'Invalid file type', code: "INVALID_FILE_TYPE"})
            }
            formData.append('files', file.buffer, file.originalname)
        }

        
        try{
            const res = await axios.post("http://localhost:5000/dashboard/scan/predict",
                formData,
                {
                    headers: formData.getHeaders()
                }
            )
            const transactions = res.data as Transactons[]
            // console.log(transactions)
            // console.log(transactions.length)
            const promiseArray = transactions.map(async(transaction) => {
                
                return await prisma.transaction.create({
                    data: {
                        category: transaction.category,
                        month: transaction.month,
                        day: transaction.day,
                        year: transaction.year,
                        description: transaction.description,
                        amount: transaction.price,
                        userId: req.user.id
                    }
                })
            })

            await Promise.all(promiseArray)
        } catch (error){
            const axiosError = error as AxiosError
           if(axiosError.status === 400){
            throwError("Invalid File Content", 400, {msg: "Unable to process statement", code: "INVALID_PROCESS"})
           } else {
            throw error
           }
        }
        

        res.json({msg: "Successfully Added Data", code: "VALID_PROCESS"})
    } catch (error){
        next(error)
    }
}

export default postDashboardDocument