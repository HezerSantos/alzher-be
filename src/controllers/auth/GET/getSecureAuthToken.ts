import { RequestHandler } from "express";
import dotenv from 'dotenv'
import jwt, { JsonWebTokenError } from 'jsonwebtoken'
import throwError from "../../../helpers/errorHelper";
dotenv.config()

const REFRESH_SECURE_AUTH_SECRET = String(process.env.REFRESH_SECURE_AUTH_SECRET)
const SECURE_AUTH_SECRET = String(process.env.SECURE_AUTH_SECRET)

const getSecureAuthToken: RequestHandler = async(req, res, next) => {
    try{

        const refreshToken = req.cookies['__Secure-secure-auth.access.refresh']

        if(!refreshToken){
            throwError("Unauthorized", 401, {msg: "Unauthorized", code: "AUTH_INVALID_TOKEN"})
        }

        const payload = jwt.verify(refreshToken, REFRESH_SECURE_AUTH_SECRET)

        console.log(payload)

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