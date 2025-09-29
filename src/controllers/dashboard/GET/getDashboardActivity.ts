import { RequestHandler } from "express";
import prisma from "../../../config/prisma";

const getDashboardActivity: RequestHandler = async(req, res, next) => {
    try{
        const userId = req.user.id
        const pageSize = Number(req.query.pageSize)
        const page = Number(req.query.page)
        const transactions = await prisma.transaction.findMany({
            where: {userId: userId},
            skip: ((page - 1) * pageSize) || 0,
            take: pageSize || 10,
            orderBy: { description: 'asc' }
        })
        res.json({
            transactionData: transactions
        })
    } catch(error){
        next(error)
    }
}

export default getDashboardActivity