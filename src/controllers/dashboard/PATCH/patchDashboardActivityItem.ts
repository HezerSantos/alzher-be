import { RequestHandler } from "express";
import prisma from "../../../config/prisma";
import throwError from "../../../helpers/errorHelper";
import validatePatchDashboardActivityItem from "../../../validation/dashboard/validatePatchDashboardActivityItem";
import { validationResult } from "express-validator";

const reversedMonthMap: Map<number, string> = new Map([
  [1, "Jan"],
  [2, "Feb"],
  [3, "Mar"],
  [4, "Apr"],
  [5, "May"],
  [6, "Jun"],
  [7, "Jul"],
  [8, "Aug"],
  [9, "Sep"],
  [10, "Oct"],
  [11, "Nov"],
  [12, "Dec"],
]);


const patchDashboardActivityItem: RequestHandler[] = [
    ...validatePatchDashboardActivityItem,
    async(req, res, next) => {
        try{
            const errros = validationResult(req)
            if(!errros.isEmpty()){
                throwError("Invalid Body", 400, { msg: "Invalid Fields", code: "INVALID_BODY", validationErrors: errros.array()})
            }


            const userId = req.user.id
            const transactionId = req.params.id
            const updatedTransactionBody = req.body
            const transaction = await prisma.transaction.findUnique({
                where: { id: transactionId }
            })

            if(!transaction){
                throwError("Transaction Not Found", 404, {msg: "Transaction Not Found", code: "INVALID_TRANSACTION_REFERENCE"})
            }
            if(transaction?.userId !== userId){
                throwError("Unauthorized Transaction Permissions", 403, {msg: "Unauthorized Transaction Permissions", code: "INVALID_TRANSACTION_PERMISSIONS"})
            }

            const [ month, day, year ] = updatedTransactionBody.transactionDate.split("/")

            const updatedTransactionData = {
                category: transaction?.category !== updatedTransactionBody.category? updatedTransactionBody.category : undefined,
                description: transaction?.description !== updatedTransactionBody.description? updatedTransactionBody.description : undefined,
                amount: Number(transaction?.amount ) !== Number(updatedTransactionBody.transactionAmount)? Number(updatedTransactionBody.transactionAmount) : undefined,
                day: Number(transaction?.day ) !== Number(day)? Number(day) : undefined,
                month: transaction?.month !== reversedMonthMap.get(month)? reversedMonthMap.get(month): undefined,
                year: Number(transaction?.year ) !== Number(year)? Number(year) : undefined
            }

            const filteredTransactionData = Object.fromEntries(Object.entries(updatedTransactionData).filter(([key, value]) => value))
            if(Object.keys(filteredTransactionData).length === 0){
                return res.end()
            }

            await prisma.transaction.update({
                where: { id: transactionId},
                data: filteredTransactionData
            })
            res.end()
        } catch (error) {
            next(error)
        }
    }
]
export default patchDashboardActivityItem