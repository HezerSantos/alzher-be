import { RequestHandler } from "express";
import validatePatchPassword from "../../validation/dashboard/validatePatchPassword";
import { validationResult } from "express-validator";
import throwError from "../../helpers/errorHelper";
import prisma from "../../config/prisma";
import argon from 'argon2'
const patchUserPassword: RequestHandler[] = [
    ...validatePatchPassword,
    async(req, res, next) => {
        try{
            const userId = req.user.id
            const errors = validationResult(req)
            if(!errors.isEmpty()){
                throwError("Invalid Credentials", 400, {msg: "Invalid Credentials", code: "INVALID_CREDENTIALS", validationErrors: [{path: "updatePassword", msg: "Passwords Do Not Match"}]})
            }

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { password: true }
            })

            const verify = await argon.verify(String(user?.password), req.body.currentPassword)

            if(!verify){
                throwError("Invalid Credentials", 400, {msg: "Invalid Credentials", code: "INVALID_CREDENTIALS", validationErrors: [{path: "updatePassword", msg: "Could Not Update Password"}]})
            }

            const newPassword = req.body.password

            const hash = await argon.hash(newPassword)
            
            await prisma.user.update({
                where: { id: userId},
                data: {
                    password: hash
                }
            })

            res.end()
        } catch (error) {
            next(error)
        }
    }
]

export default patchUserPassword