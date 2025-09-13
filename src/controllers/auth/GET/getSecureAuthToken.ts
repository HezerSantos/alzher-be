import { RequestHandler } from "express";
import dotenv from 'dotenv'
import jwt, { JsonWebTokenError } from 'jsonwebtoken'
import throwError from "../../../helpers/errorHelper";
dotenv.config()

const REFRESH_SECURE_AUTH_SECRET = String(process.env.REFRESH_SECURE_AUTH_SECRET)
const SECURE_AUTH_SECRET = String(process.env.SECURE_AUTH_SECRET)


interface TokenType {
    id: string,
    iat: number,
    exp: number
}
const getSecureAuthToken: RequestHandler = async(req, res, next) => {
    try{

        const refreshToken = req.cookies['__Secure-secure-auth.access.refresh']

        if(!refreshToken){
            throwError("Unauthorized", 401, {msg: "Unauthorized", code: "AUTH_INVALID_TOKEN"})
        }

        const refreshPayload = jwt.verify(refreshToken, REFRESH_SECURE_AUTH_SECRET) as TokenType

        const accessPayload = { id: refreshPayload.id }

        const secureToken = jwt.sign(accessPayload, SECURE_AUTH_SECRET, {expiresIn: "15m"})

            res.cookie('__Secure-secure-auth.access', secureToken, {
                httpOnly: true, 
                secure: true, 
                maxAge: 15 * 1000 * 60, 
                sameSite: "none",
                path: "/",
                domain: process.env.NODE_ENV === "production"? ".hallowedvisions.com" : ""
            })
        res.end()
    } catch(error){
        if(error instanceof JsonWebTokenError){
            throwError("Unauthorized", 401, {msg: "Unauthorized", code: "AUTH_INVALID_TOKEN"})
        } else {
            next(error)
        }  
    }
}

export default getSecureAuthToken