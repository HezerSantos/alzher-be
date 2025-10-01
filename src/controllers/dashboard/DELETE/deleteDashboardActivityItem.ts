import { RequestHandler } from "express";
import prisma from "../../../config/prisma";
import throwError from "../../../helpers/errorHelper";

const deleteDashboardActivityItem: RequestHandler = async(req, res, next) => {
    try{
        const userId = req.user.id

        const transactionId = req.params.id

        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId }
        })

        if(!transaction){
            throwError("Transaction Not Found", 404, {msg: "Transaction Not Found", code: "INVALID_TRANSACTION_REFERENCE"})
        }
        if(transaction?.userId !== userId){
            throwError("Unauthorized Transaction Permissions", 403, {msg: "Unauthorized Transaction Permissions", code: "INVALID_TRANSACTION_PERMISSIONS"})
        }

        await prisma.transaction.delete({
            where: { id: transactionId }
        })
       res.json({msg: `Transaction ${transactionId} was deleted`})
    } catch (error) {
        next(error)
    }
}

export default deleteDashboardActivityItem