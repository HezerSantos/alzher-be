import { RequestHandler } from "express";
import prisma from "../../../config/prisma";

const getDashboardAnalytics: RequestHandler = async(req, res, next) => {
    try{
        const userId = req.user.userId
        

        //TOTAL SPENT
        const totalSpent = await prisma.transaction.aggregate({
            where: {
                userId: userId
            },
            _sum:{
                amount: true
            }
        })

        //Returns the most frequent category
        const mostFrequentCategory = await prisma.transaction.groupBy({
            by: ['category'],  
            where: { userId: userId },    
            _count: { category: true }, 
            orderBy: { _count: { category: 'desc' } }, 
            take: 1
        });

        //Returns the category that is most spent
        const largestCategoryExpense = await prisma.transaction.groupBy({
            by: ['category'],
            where: {
                userId: userId  
            },
            _sum:{
                amount: true
            },
            orderBy: {_sum: {amount: 'desc'}},
            take: 1
        })
        
        //Queries the yearly sums
        const yearlySums = await prisma.transaction.groupBy({
            by: ['year'],
            where: { userId: userId },
            _sum: { amount: true },
        })

        //Calculates the yearly average
        const yearlyAverage = yearlySums.reduce((acc, year) => {
            acc = acc + Number(year._sum.amount)
            return acc
        }, 0) / yearlySums.length

        //Returns the largest month by sum
        const largestMonthlyExpense = await prisma.transaction.groupBy({
            by: ['month'],
            where: { userId: userId },
            _sum: { amount: true },
            orderBy: { _sum: { amount: 'desc' } },
            take: 1
        })
        
        
        //Returns the total monthly expense
        const monthlyExpense = await prisma.transaction.groupBy({
            by: ['month'],
            where: { userId: userId },
            _sum: { amount: true }
        })

        //Returns the average monthly expense
        const averageMonthlyExpense = monthlyExpense.reduce((acc, month) => {
            acc = acc + Number( month._sum.amount)
            return acc
        }, 0) / monthlyExpense.length

        console.log(totalSpent)
        console.log(averageMonthlyExpense)

        res.end()
    } catch(error){
        next(error)
    }
}

export default getDashboardAnalytics