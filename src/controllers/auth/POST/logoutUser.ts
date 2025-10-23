import { RequestHandler } from "express";
import dotenv from 'dotenv'
dotenv.config()
const logoutUser: RequestHandler = async(req, res, next) => {
    try{
        res.clearCookie('__Secure-secure-auth.access', {
            httpOnly: true, 
            secure: true, 
            maxAge: 15 * 1000 * 60, 
            sameSite: "none",
            path: "/",
            domain: process.env.NODE_ENV === "production"? ".hallowedvisions.com" : ""
        })
        res.clearCookie('__Secure-secure-auth.access.refresh',{
            httpOnly: true, 
            secure: true, 
            maxAge: 604800000, 
            sameSite: "none",
            path: "/",
            domain: process.env.NODE_ENV === "production"? ".hallowedvisions.com" : ""
        })

        res.end()
    } catch (error) {
        next(error)
    }
}

export default logoutUser