import { RequestHandler } from "express";
import jwt, { JsonWebTokenError } from 'jsonwebtoken'
import dotenv from 'dotenv'
import throwError from "../../../helpers/errorHelper";
dotenv.config()

const SECURE_AUTH_SECRET = String(process.env.SECURE_AUTH_SECRET)
const verifyUser: RequestHandler = (req, res, next) => {
    try{
        const secureAuthCookie = req.cookies['__Secure-secure-auth.access']

        if(!secureAuthCookie){
            throwError("Unauthorized", 401, [{msg: "Unauthorized"}])
        }
        const access = jwt.verify(secureAuthCookie, SECURE_AUTH_SECRET)
        
        req.user = access
        

        next()
    } catch(error) {
        if(error instanceof JsonWebTokenError){
            error.message
        }
        next(error)
    }
}

export default verifyUser