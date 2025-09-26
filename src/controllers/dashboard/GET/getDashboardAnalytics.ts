import e, { RequestHandler } from "express";
import prisma from "../../../config/prisma";

const getDashboardAnalytics: RequestHandler = async(req, res, next) => {
    try{
        console.time("Analytics")
        const userId = req.user.id

        //TOTAL SPENT
        const totalSpentPromises =  prisma.transaction.aggregate({
            where: {
                userId: userId
            },
            _sum:{
                amount: true
            }
        })

        //Returns the most frequent category
        const mostFrequentCategoryPromises = prisma.transaction.groupBy({
            by: ['category'],  
            where: { userId: userId },    
            _count: { category: true }, 
            orderBy: { _count: { category: 'desc' } }, 
            take: 1
        }) ?? []
        
        //Returns the category that is most spent
        const largestCategoryExpensePromises = prisma.transaction.groupBy({ 
            by: ['category'],
            where: {
                userId: userId  
            },
            _sum:{
                amount: true
            },
            orderBy: {_sum: {amount: 'desc'}},
            take: 1
        }) ?? []
        
        //Queries the yearly sums
        const yearlySumsPromises = prisma.transaction.groupBy({
            by: ['year'],
            where: { userId: userId },
            _sum: { amount: true },
            orderBy: { year: 'desc' }
        }) ?? []
                
        //Returns the total monthly expense
        const monthlyExpensePromises = prisma.transaction.groupBy({
            by: ['month'],
            where: { userId: userId },
            _sum: { amount: true },
            orderBy: { _sum: { amount: 'desc' } },
        }) ?? []


        
        //Returns a spendingPerDay[] ordered by desc

        const spendingsPerDayPromises = prisma.transaction.groupBy({
            by:['day'],
            where: { userId: userId },
            _sum: {
                amount: true
            },
            _count: { day: true},
            orderBy: {_sum: { amount: 'desc' } }
        }) ?? []


        const totalTransactionCountPromises = prisma.transaction.aggregate({
            where: {
                userId: userId
            },
           _count: true
        })

        const [
            totalSpent, 
            mostFrequentCategory, 
            largestCategoryExpense, 
            yearlySums, 
            monthlyExpense, 
            spendingsPerDay,
            totalTransactionCount 
        ] = await Promise.all([totalSpentPromises, mostFrequentCategoryPromises, largestCategoryExpensePromises, yearlySumsPromises, monthlyExpensePromises, spendingsPerDayPromises, totalTransactionCountPromises])

        if(totalSpent._sum.amount === null){
            return res.json(null)
        }

        //Calculates the yearly average
        const yearlyAverage = yearlySums.reduce((acc, year) => { //YEARLY SUMS PROMISES
            acc = acc + Number(year._sum.amount)
            return acc
        }, 0) / yearlySums.length


        //Returns the average monthly expense
        const averageMonthlyExpense = monthlyExpense.reduce((acc, month) => { //MONTHLY EXPENSE PROMISES
            acc = acc + Number( month._sum.amount)
            return acc
        }, 0) / monthlyExpense.length



        //Highest Day and Lowest Day
        const highestDay = spendingsPerDay[0]?.day
        const lowestDay = spendingsPerDay[spendingsPerDay.length - 1]?.day


        interface DashboardAnalyticsInfoType {
            header: string,
            amountSpent: number | null,
            primarySubHeader: string | null,
            primarySubValue: string | null,
            secondarySubHeader: string | null,
            secondarySubValue: string | null
        }

        const dashboardAnalyticsInfo: DashboardAnalyticsInfoType[] = [
            {
                header: "Total Spent",
                amountSpent: totalSpent._sum.amount,
                primarySubHeader: "Frequent Category",
                primarySubValue: mostFrequentCategory[0].category,
                secondarySubHeader: "Largest Expense",
                secondarySubValue: largestCategoryExpense[0].category
            },
            {
                header: "Yearly Average",
                amountSpent: yearlyAverage,
                primarySubHeader: "Peak Month",
                primarySubValue: monthlyExpense[0].month,
                secondarySubHeader: null,
                secondarySubValue: null
            },
            {
                header: "Monthly Average",
                amountSpent: averageMonthlyExpense,
                primarySubHeader: "Highest Day",
                primarySubValue: `${highestDay} of the month`,
                secondarySubHeader: "Lowest Day",
                secondarySubValue: `${lowestDay} of the month`
            },
            {
                header: "Total Transactions",
                amountSpent: totalTransactionCount._count,
                primarySubHeader: null,
                primarySubValue: null,
                secondarySubHeader: null,
                secondarySubValue: null
            }
        ]

        
        //Data for yearly line chart
        const yearlyLineChart = yearlySums.map((year) => {
            return {
                year: year.year,
                total: year._sum.amount
            }
        }) 

        //Returns the monthly data grouped by year
        const groupedByMonthYearData = await prisma.transaction.groupBy({
            by: ['month', 'year'],
            where: { userId: userId },
            _sum: { amount: true},
            orderBy: {year: 'desc'}
        })
        
        //Turns monthly data grouped by year into a hash map of [month, Map<year, value>]
        const cleanedMonthlyYearData = groupedByMonthYearData.reduce((acc, entry) => {
            if(!acc.has(entry.month)){
                acc.set(String(entry.month), new Map([ [entry.year, entry._sum.amount] ]))
                return acc
            } else {
                const monthValues = acc.get(entry.month)
                 monthValues.set(entry.year, entry._sum.amount)
                 return acc
            }
        }, new Map())

        //Maps into monthly bar chart data
        const monthlyBarChartData = [...cleanedMonthlyYearData].map(([month, yearMap], index) => {
            const targetedYears = [...yearMap].slice(0,2)
            return {
                month: month,
                [targetedYears[0][0]]: targetedYears[0][1],
                ...(targetedYears[1] ? { [targetedYears[1][0]]: targetedYears[1][1] } : {})
            }
        })
        
        //Scatter Data
        const scatterData = spendingsPerDay.map(day => {
            return{
                dailyAverage: Number(day._sum.amount) / day._count.day,
                dateOfMonth: day.day
            }
        })

        console.log(monthlyBarChartData)

        // console.log(scatterData)
        console.timeEnd("Analytics")
        res.end()
    } catch(error){
        next(error)
    }
}

export default getDashboardAnalytics