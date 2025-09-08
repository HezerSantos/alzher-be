import { RequestHandler } from "express";
import validateCreateUser from "../../../validation/auth/validateCreateUser";
import { validationResult } from "express-validator";
import throwError from "../../../helpers/errorHelper";
import prisma from "../../../config/prisma";

const createUser: RequestHandler[] = [
    ...validateCreateUser,
    async (req, res, next) => {
        try{
            const errors = validationResult(req)
            console.log(errors.array())
            if(!errors.isEmpty()){
                throwError("Auth Error", 400, {errors: errors.array()})
            }

            // await prisma.user.create({
            //     data: {
            //         email: req.body.email,
            //         password: req.body.password
            //     }
            // })
            // return res.json({
            //     data: "success"
            // })
        } catch (error){
            next(error)
        }
    }
]

export default createUser