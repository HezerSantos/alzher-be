import { RequestHandler } from "express";
import * as crypto from 'crypto'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()


const getCsrfController: RequestHandler = async(req, res, next) => {
    try{
        const csrfValue = crypto.randomBytes(32).toString('hex')

        const csrfToken:string = jwt.sign({csrfToken: csrfValue, key: Math.floor(Math.random() * 10)}, String(process.env.CSRF_SECRET), {expiresIn: '15m'})
        res.cookie('__Secure-auth.csrf', csrfToken, {
            httpOnly: false, 
            secure: true, 
            maxAge: 5 * 1000 * 60, 
            sameSite: "none",
            path: "/",
            domain: process.env.NODE_ENV === "production"? ".hallowedvisions.com" : ""
        })


        res.status(200).end()
    } catch(error) {
        next(error)
    }
}

export default getCsrfController