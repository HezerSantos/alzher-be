import { RequestHandler } from "express";
import prisma from "../../../config/prisma";


const monthMap: Map<string, number> = new Map([
  ["Jan", 1],
  ["Feb", 2],
  ["Mar", 3],
  ["Apr", 4],
  ["May", 5],
  ["Jun", 6],
  ["Jul", 7],
  ["Aug", 8],
  ["Sep", 9],
  ["Oct", 10],
  ["Nov", 11],
  ["Dec", 12],
]);


const getDashboardActivity: RequestHandler = async(req, res, next) => {
    try{
        const userId = req.user.id
        const pageSize = Number(req.query.pageSize)
        const page = Number(req.query.page)
        const transactions = await prisma.transaction.findMany({
            where: {userId: userId},
            skip: ((page - 1) * pageSize) || 0,
            take: pageSize || 10,
            orderBy: { amount: 'desc' }
        })

        const maxPages = await prisma.transaction.aggregate({
            where: {userId: userId},
            _count: true
        })

        let mappedTransactions
        if(transactions.length >= 1){
            mappedTransactions = transactions.map(transaction => {
                return {
                    transactionId: transaction.id,
                    category: transaction.category,
                    description: transaction.description,
                    transactionDate: `${monthMap.get(transaction.month)}/${transaction.day}/${transaction.year}`,
                    transactionAmount: transaction.amount.toFixed(2)

                }
            })
        }

        res.json({
            transactionData: mappedTransactions? mappedTransactions : transactions,
            previousPageFlag: ( page || 1 ) > 1,
            nextPageFlag: ( page || 1 ) < (maxPages._count / (pageSize || 10))
        })
    } catch(error){
        next(error)
    }
}

export default getDashboardActivity