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
        const categoryFilter = req.query.categoryFilter
        const keyWord = req.query.keyWord
        

        const whereOptions: any = {
            userId: userId,
        }

        if(categoryFilter){
            whereOptions.category = categoryFilter
        }

        if(keyWord){
            whereOptions.description = {
                contains: keyWord,
                mode: 'insensitive'
            }
        }

        const transactions = await prisma.transaction.findMany({
            where: whereOptions,
            skip: ((page - 1) * (pageSize || 10)) || 0,
            take: pageSize || 10,
            orderBy: { amount: 'desc' }
        })

        const maxPages = await prisma.transaction.aggregate({
            where: whereOptions,
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
            transactionData: mappedTransactions? mappedTransactions : null,
            previousPageFlag: transactions.length === 0? false : ( page || 1 ) > 1,
            nextPageFlag: transactions.length === 0? false : ( page || 1 ) < (maxPages._count / (pageSize || 10))
        })
    } catch(error){
        next(error)
    }
}

export default getDashboardActivity