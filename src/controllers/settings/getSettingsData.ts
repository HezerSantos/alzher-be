import { RequestHandler } from "express";
import prisma from "../../config/prisma";

const getSettingsData: RequestHandler = async(req, res, next) => {
    try{
        const userId = req.user.id

        const email = await prisma.user.findUnique({
            where: { id: userId},
            select: {
                email: true
            }
        })

        res.json({
            email: email?.email
        })
    } catch (error){
        next(error)
    }
}

export default getSettingsData