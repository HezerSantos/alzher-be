import { RequestHandler } from "express";
import prisma from "../../../config/prisma";

const getDashboardAnalytics: RequestHandler = async(req, res, next) => {
    try{
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
        })
        
        //Returns the category that is most spent
        const categoryExpensePromises = prisma.transaction.groupBy({ 
            by: ['category'],
            where: {
                userId: userId  
            },
            _sum:{
                amount: true
            },
            orderBy: {_sum: {amount: 'desc'}}
        })
        
        //Queries the yearly sums
        const yearlySumsPromises = prisma.transaction.groupBy({
            by: ['year'],
            where: { userId: userId },
            _sum: { amount: true },
            _count: { year: true },
            orderBy: { year: 'desc' }
        })
                
        //Returns the total monthly expense
        const monthlyExpensePromises = prisma.transaction.groupBy({
            by: ['month'],
            where: { userId: userId },
            _sum: { amount: true },
            orderBy: { _sum: { amount: 'desc' } },
        })


        
        //Returns a spendingPerDay[] ordered by desc

        const spendingsPerDayPromises = prisma.transaction.groupBy({
            by:['day'],
            where: { userId: userId },
            _sum: {
                amount: true
            },
            _count: { day: true},
            orderBy: {_sum: { amount: 'desc' } }
        })


        const totalTransactionCountPromises = prisma.transaction.aggregate({
            where: {
                userId: userId
            },
           _count: true
        })

        const [
            totalSpent, 
            mostFrequentCategory, 
            categoryExpense, 
            yearlySums, 
            monthlyExpense, 
            spendingsPerDay,
            totalTransactionCount 
        ] = await Promise.all([totalSpentPromises, mostFrequentCategoryPromises, categoryExpensePromises, yearlySumsPromises, monthlyExpensePromises, spendingsPerDayPromises, totalTransactionCountPromises])

        if(totalSpent._sum.amount === null){
            return res.json({
                dashboardAnalyticsInfo: null,
                yearlyData: null,
                categoryData: null,
                overviewData: null,
                scatterData: null
            })
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
                secondarySubValue: categoryExpense[0].category
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
                total: Number((year._sum.amount)?.toFixed(2))
            }
        }) 

        //Returns the monthly data grouped by year
        const groupedByMonthYearData = await prisma.transaction.groupBy({
            by: ['month', 'year'],
            where: { userId: userId },
            _sum: { amount: true},
            orderBy: {year: 'desc'}
        })
        const monthOrder = new Map([
            ["Jan", 1], ["Feb", 2], ["Mar", 3], ["Apr", 4],
            ["May", 5], ["Jun", 6], ["Jul", 7], ["Aug", 8],
            ["Sep", 9], ["Oct", 10], ["Nov", 11], ["Dec", 12]
        ]);
        const sortedGroupedByMonthYearData = groupedByMonthYearData.sort((a, b) => monthOrder.get(a.month)! - monthOrder.get(b.month)!)
        //Turns monthly data grouped by year into a hash map of [month, Map<year, value>]
        const cleanedMonthlyYearData = sortedGroupedByMonthYearData.reduce((acc, entry) => {
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
                [targetedYears[0][0]]: Number((targetedYears[0][1]).toFixed(2)),
                ...(targetedYears[1] ? { [targetedYears[1][0]]: Number((targetedYears[1][1]).toFixed(2)) } : {})
            }
        })
        
        //Scatter Data
        const scatterData = spendingsPerDay.map(day => {
            return{
                dailyAverage: Number((Number(day._sum.amount) / day._count.day).toFixed(2)),
                dateOfMonth: day.day
            }
        })


        
        //Promises to get unique Years, Months, Days
        const uniqueYearsPromises = prisma.transaction.findMany({
            where: { userId: userId },
            select: { year: true },
            distinct: ['year']
        })
        const uniqueMonthsPromises = prisma.transaction.findMany({
            where: { userId: userId },
            select: { month: true },
            distinct: ['month']
        })
        const uniqueDaysPromises = prisma.transaction.findMany({
            where: { userId: userId },
            select: { day: true },
            distinct: ['day']
        })

        //Promise.all
        const [
            uniqueYears,
            uniqueMonths,
            uniqueDays
        ] = await Promise.all([uniqueYearsPromises, uniqueMonthsPromises, uniqueDaysPromises])


        //Maps to create chart data
        const categoryChartData = categoryExpense.map( category => {
            return {
                category: category.category,
                ['Yearly Average']: Number((Number(category._sum.amount) / uniqueYears.length).toFixed(2)),
                ['Monthly Average']: Number((Number(category._sum.amount) / uniqueMonths.length).toFixed(2)),
                ['Daily Average']: Number((Number(category._sum.amount) / uniqueDays.length).toFixed(2)),
                total: Number(Number(category._sum.amount).toFixed(2))
            }
        })


        res.json({
            dashboardAnalyticsInfo: dashboardAnalyticsInfo,
            yearlyData: yearlyLineChart.reverse(),
            categoryData: categoryChartData, 
            overviewData: monthlyBarChartData, 
            scatterData: scatterData
        })
    } catch(error){
        next(error)
    }
}

export default getDashboardAnalytics