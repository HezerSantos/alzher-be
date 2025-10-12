import { RequestHandler } from "express";
import validatePatchEmail from "../../../validation/dashboard/validatePatchEmail";
import { validationResult } from "express-validator";
import throwError from "../../../helpers/errorHelper";
import prisma from "../../../config/prisma";
import argon from "argon2"
const patchUserEmail: RequestHandler[] = [
    ...validatePatchEmail,
    async(req, res, next) => {
        try{
            const userId = req.user.id

            const errors = validationResult(req)

            if(!errors.isEmpty()){
                throwError("Invalid Credentials", 400, {msg: "Invalid Credentials", code: "INVALID_CREDENTIALS", validationErrors: [{path: "updateCredentials", msg: "Failed to Update Email"}]})
            }

            const userInfo = await prisma.user.findUnique({
                where: {id: userId},
                select: { password: true }
            })


            const verify = await argon.verify(String(userInfo?.password), req.body.password)

            if(!verify){
                throwError("Invalid Credentials", 400, {msg: "Invalid Credentials", code: "INVALID_CREDENTIALS", validationErrors: [{path: "updateCredentials", msg: "Failed to Update Email"}]})
            }

            await prisma.user.update({
                where: { id: userId },
                data: { email: req.body.newEmail }
            })
            res.end()
        } catch (error) {
            next(error)
        }
    }
]

export default patchUserEmail