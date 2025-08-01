import { RequestHandler } from "express";
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { JsonWebTokenError } from "jsonwebtoken";
import throwError from "../../helpers/errorHelper";
dotenv.config()


const PUBLIC_AUTH_SECRET = String(process.env.PUBLIC_AUTH_SECRET)


const verifyPublicAuthToken: RequestHandler = async(req, res, next) => {
    try{
        const authCookie = req.cookies['__Secure-public-auth.access']
        if(!authCookie){
            throwError("Unauthorized", 401, [{msg: "Unauthorized"}])
            return
        }
        jwt.verify(authCookie, PUBLIC_AUTH_SECRET)
        next()
    } catch(error){
        const jwtError = error as JsonWebTokenError || Error
        if(jwtError.name === 'JsonWebTokenError' || jwtError.name === 'TokenExpiredError'){
            throwError("401", 401, [{msg: "Unauthorized"}])
        } else {
            next(error)
        }
    }
}

export default verifyPublicAuthToken