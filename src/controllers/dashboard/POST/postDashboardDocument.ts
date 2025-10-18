import axios, {AxiosError} from "axios";
import FormData from "form-data";
import { RequestHandler } from "express";
import fileType from 'file-type';
import throwError from "../../../helpers/errorHelper";
import prisma from "../../../config/prisma";
import crypto from 'crypto';

interface Transactons {
    transactionArray: {
        month: string,
        day: number,
        year: number,
        description: string,
        price: number,
        category: string
    }[],
    transactionHashes: string[]
}



const postDashboardDocument: RequestHandler = async(req, res, next) => {
    try{
        const userId = req.user.id
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

        const hashes = files.map(file => crypto.createHash("sha256").update(file.buffer).digest("hex"))

        const statements = await prisma.statements.findMany({
            where: { statementId: { in: hashes }, userId: userId }
        })

        if (statements.length) {
            throwError("Existing Files", 409, {msg: "Files already exist", code: "INVALID_DUPLICATE"})
        }

        try{
            const res = await axios.post("http://localhost:5000/dashboard/scan/predict",
                formData,
                {
                    headers: formData.getHeaders()
                }
            )
            const transactions = res.data as Transactons
            // console.log(transactions)
            // console.log(transactions.length)
            // console.log(transactions.transactionHashes)
            // console.log(hashes)
            const promiseArray = transactions.transactionArray.map(async(transaction) => {
                
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
            await prisma.statements.createMany({
                data: transactions.transactionHashes.map((hash) => {
                    return {
                        statementId: hash,
                        userId: userId
                    }
                })
            })
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