import { RequestHandler } from "express";
import jwt, { JsonWebTokenError } from 'jsonwebtoken'
import dotenv from 'dotenv'
import throwError from "../../../helpers/errorHelper";
dotenv.config()

const REFRESH_SECURE_AUTH_SECRET = String(process.env.REFRESH_SECURE_AUTH_SECRET)

const getCheckSecureAuthToken: RequestHandler = async(req, res, next) => {
    try{
        const secureAuthRefreshToken = req.cookies['__Secure-secure-auth.access.refresh']
        
        if(!secureAuthRefreshToken){
            throwError("Invalid Session", 401, {msg: "User Not Logged In", code: "INVALID_SESSION"})
        }

        jwt.verify(secureAuthRefreshToken, REFRESH_SECURE_AUTH_SECRET)
        res.end()
    } catch (error) {
                if(error instanceof JsonWebTokenError){
            throwError("Invalid Session", 401, {msg: "User Not Logged In", code: "INVALID_SESSION"})
        } else {
            next(error)
        }  
    }
}

export default getCheckSecureAuthToken