import { RequestHandler } from "express";
import validateLoginUser from "../../../validation/auth/validateLoginUser";
import { validationResult } from "express-validator";
import throwError from "../../../helpers/errorHelper";
import prisma from "../../../config/prisma";
import argon2 from "argon2";
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const SECURE_AUTH_SECRET = String(process.env.SECURE_AUTH_SECRET)
const REFRESH_SECURE_AUTH_SECRET = String(process.env.REFRESH_SECURE_AUTH_SECRET)
type AuthenticateUserType = (
    email: string,
    password: string
) => Promise<{
    userId: string
}>

const authenticateUser: AuthenticateUserType = async(email, password) => {
    const user = await prisma.user.findUnique({
        where: { email }
    });

    // Default fake hash (argon2 format)
    const fakeHash = "$argon2id$v=19$m=65536,t=3,p=4$C0ZlYXR1cmU$FAKEHASHFAKEHASHFAKEHA";

    // Always verify password, real or fake
    const hashToVerify = user?.password ?? fakeHash;
    const match = await argon2.verify(hashToVerify, password);

    if (!match || !user) {
        throwError("Unauthorized", 401, { msg: "Invalid Username or Password", code: "INVALID_CREDENTIALS" });
    }

    return {
        userId: String(user?.id)
    };
}
const loginUser: RequestHandler[] = [
    ...validateLoginUser,
    async(req, res, next) => {
        try{
            const errors = validationResult(req)

            if(!errors.isEmpty()) {
                throwError("Invalid username or password", 400, { msg: "Invalid Credentials", code:"INVALID_CREDENTIALS", validationErrors: errors.array() })
            }

            const email = req.body.email
            const password = req.body.password

            const result = await authenticateUser(email, password)

            const payload = {
                id: result.userId
            }

            const secureToken = jwt.sign(payload, SECURE_AUTH_SECRET, {expiresIn: '15m'})
            const secureRefreshToken = jwt.sign(payload, REFRESH_SECURE_AUTH_SECRET, {expiresIn: "7d"})
            res.cookie('__Secure-secure-auth.access', secureToken, {
                httpOnly: true, 
                secure: true, 
                maxAge: 15 * 1000 * 60, 
                sameSite: "none",
                path: "/",
                domain: process.env.NODE_ENV === "production"? ".hallowedvisions.com" : ""
            })
            
            res.cookie('__Secure-secure-auth.access.refresh', secureRefreshToken, {
                httpOnly: true, 
                secure: true, 
                maxAge: 604800000, 
                sameSite: "none",
                path: "/",
                domain: process.env.NODE_ENV === "production"? ".hallowedvisions.com" : ""
            })

            res.end()
        } catch(error) {
            next(error)
        }
    }
]

export default loginUser
