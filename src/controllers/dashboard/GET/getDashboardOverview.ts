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

        

        const mappedYears = new Set(years.map(entry => entry.year))

        if(mappedYears.size === 0){
            return res.json({chartData: null})
        }
        
        if(!mappedYears.has(Number(queryYear)) || (Number(semester) !== 1  && Number(semester) !== 2) ){
            throwError("Bad Request", 400, {msg: "Bad Request", code: "INVALID_QUERY"})
        }

        selectedSemester = semesterMap.get(Number(semester))

        const userAggregate = await prisma.transaction.aggregate({
            where: {
                userId: req.user.id,
                year: Number(queryYear),
            },
            _sum: {
                amount: true
            }
        })

        const distinctMonths = await prisma.transaction.groupBy({
        by: ['month'],
        where: {
            userId: req.user.id,
            year: Number(queryYear),
        },
        });

        

        const monthlyPromises = selectedSemester?.map( async(month) => {
            return await prisma.transaction.findMany({
                where: {
                    userId: req.user.id,
                    year: Number(queryYear),
                    month: month
                }, 
                select: {
                    amount: true,
                    month: true
                }
            })
        }) ?? []
        
        const monthlyData = await Promise.all(monthlyPromises)

        console.log(monthlyData)
        const yearSum = userAggregate._sum
        const monthlyAverage = Number(yearSum) / distinctMonths.length


        res.end()
    } catch(error){
        next(error)
    }
}

export default getDashboardOverview