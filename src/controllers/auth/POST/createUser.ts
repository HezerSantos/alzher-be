import { RequestHandler } from "express";
import validateCreateUser from "../../../validation/auth/validateCreateUser";
import { validationResult } from "express-validator";
import throwError from "../../../helpers/errorHelper";
import prisma from "../../../config/prisma";
import argon2 from "argon2";

const createUser: RequestHandler[] = [
    ...validateCreateUser,
    async (req, res, next) => {
        try{
            const errors = validationResult(req)
            if(!errors.isEmpty()){
                throwError("Auth Error", 400, { msg: "Invalid Credentials", code:"INVALID_CREDENTIALS", validationErrors: errors.array() })
            }

            const password = req.body.password
            const hashedPassowrd = await argon2.hash(password)

            await prisma.user.create({
                data: {
                    email: req.body.email,
                    password: hashedPassowrd
                }
            })
            return res.json({
                data: "success"
            })
        } catch (error){
            next(error)
        }
    }
]

export default createUser