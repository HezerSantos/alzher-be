import { RequestHandler } from "express";
import prisma from "../../../config/prisma";
import throwError from "../../../helpers/errorHelper";

const getDashboardOverview: RequestHandler = async(req, res, next) => {
    try{
        const semesterMap = new Map([
            [1, ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']],
            [2, ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']]
        ])
        const queryYear = req.query.year
        const semester = req.query.semester
    
        let selectedSemester
        //GET ALL YEARS
        const years: {year: number}[] = await prisma.$queryRaw`
            SELECT DISTINCT "year"
            FROM "Transaction"
            WHERE "userId" = ${req.user.id}
        `

        
        //CREATE A SET FOR FAST CHECKING
        const mappedYears = new Set(years.map(entry => entry.year))

        //RETURN IF NO DATA
        if(mappedYears.size === 0){
            return res.json({chartData: null})
        }
        
        //THROW ERROR FOR INVALID QUERY
        if(!mappedYears.has(Number(queryYear)) || (Number(semester) !== 1  && Number(semester) !== 2) ){
            console.log(queryYear, semester)
            throwError("Bad Request", 400, {msg: "Bad Request", code: "INVALID_QUERY"})
        }

        //SET THE SEMESTER
        selectedSemester = semesterMap.get(Number(semester))
        
        //PROMISE TO GET SUM OF ALL TRANSACTIONS OF THE YEAR
        const userAggregatePromises = prisma.transaction.aggregate({
            where: {
                userId: req.user.id,
                year: Number(queryYear),
            },
            _sum: {
                amount: true
            }
        })

        //PROMISE TO GET ALL THE MONTHS OF THE YEAR
        const distinctMonthsPromises = prisma.transaction.groupBy({
        by: ['month'],
        where: {
            userId: req.user.id,
            year: Number(queryYear),
        },
        });

        
        //PROMISE TO GET ALL TRANSACTIONS OF ALL MONTHS OF THE YEAR
        const monthlyPromises = selectedSemester?.map( async(month) => {
            return await prisma.transaction.findMany({
                where: {
                    userId: req.user.id,
                    year: Number(queryYear),
                    month: month
                }, 
                select: {
                    amount: true,
                    month: true,
                    category: true
                }
            })
        }) ?? []
        
        const [userAggregate, distinctMonths, monthlyData] = await Promise.all([userAggregatePromises, distinctMonthsPromises, Promise.all(monthlyPromises)])
        
        const filteredMonthlyData = monthlyData.filter(data => data.length !== 0)

        
        //REDUCE THE TRANSACTIONS GROUPED BY MONTH AND ADD THE CATEGORIES 
        const monthlyDataCleaned = filteredMonthlyData.map(month => {
            return [month[0].month, month.reduce((acc, t) => {
                if(!acc.has(t.category)){
                    acc.set(t.category, t.amount)
                } else {
                    acc.set(t.category, acc.get(t.category) + t.amount)
                }

                return acc
            }, new Map())]
        })

        
        //MAP TO CREATE DATA FORM SPECIFIC TO MONTH ITEM FOR FRONT
        const monthItems = monthlyDataCleaned.map(([month, map]) => {
            return {
                month: month,
                year: queryYear,
                highestCategory: [...map].reduce((acc, [category, total]) => {
                    if(acc.total < total){
                        acc.total = total
                        acc.category = category
                        return acc
                    } else {
                        return acc
                    }
                }, {category: "", total: 0}).category,
                lowestCategory: [...map].reduce((acc, [category, total]) => {
                    if(acc.total > total){
                        acc.total = total
                        acc.category = category
                        return acc
                    } else {
                        return acc
                    }
                }, {category: "", total: Infinity}).category,
                totalSpent: [...map].reduce((acc, [ category, total ]) => {
                    return acc + total
                }, 0).toFixed(2)
            }
        })

        //DATA FOR THE CHART
        const chartData = monthItems.map(month => {
            return {
                month: month.month,
                [String(queryYear)]: Number(month.totalSpent)
            }
        })

        //Returns the highest month of spending
        const peakMonth = chartData.reduce((acc, month) => {
            if(acc.total < month[String(queryYear)]){
                acc.total = month[String(queryYear)]
                acc.month = month.month
                return acc
            } else {
                return acc
            }
        }, {month: "", total: 0}).month

        //Maps the categories and totals them
        const categoryMap = [...new Map(monthlyDataCleaned as [string, Map<string, number>][]).values()].reduce((acc, monthMap) => {
            for (const [ category, total] of monthMap){
                if(!acc.has(category)){
                    acc.set(category, total)
                } else {
                    acc.set(category, acc.get(category) + total)
                }
            }

            return acc
        }, new Map())

        //Returns the highest category
        const highestCategory = [...categoryMap.entries()].reduce((acc, [category, total]) => {
            if(acc.total < total){
                acc.category = category
                acc.total = total
                return acc
            } else {
                return acc
            }
        }, {category: "", total: 0}).category

        //DATA FOR OVERVIEW ITEMS
        const overviewDetailsItems = [
            {
                header: "Total Spent",
                price: userAggregate._sum.amount?.toFixed(2),
                details: [
                    {
                        heading: "Peak Month",
                        value: peakMonth
                    },
                    {
                        heading: "Largest Expense",
                        value: highestCategory
                    }
                ]
            },
            {
                header: "Monthly Average",
                price: (Number(userAggregate._sum.amount) / distinctMonths.length).toFixed(2)
            }
        ]
        
        


        res.json({
            year: queryYear,
            overviewDetailsItems,
            chartData: chartData.length !== 0? chartData : null,
            monthItems: monthItems.length !==0? monthItems : null,
            yearList: Array.from(mappedYears)
        })
    } catch(error){
        next(error)
    }
}

export default getDashboardOverview