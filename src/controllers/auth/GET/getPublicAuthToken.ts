import { RequestHandler } from "express";
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import throwError from "../../../helpers/errorHelper";
dotenv.config()


const blockedUserAgents: Set<string> = new Set(
[
  "curl/7.64.1",           // Common command-line tool used in bots or scraping scripts
  "python-requests/2.22.0", // Requests library, often used by scrapers
  "node-fetch/2.6.0",       // Fetch API, common in scraping scripts
  "Wget/1.19.5 (linux-gnu)", // Wget command-line tool, used in bots
  "Bot/1.0 (https://www.somebot.com)", // Generic or self-identified bot
  "Go-http-client/1.1",     // Go language HTTP client, common in scraping bots
  "urllib/3.7",             // Python's urllib library, common in scraping bots
  "lxml/4.5.0 (https://lxml.de/)", // Python lxml library used for scraping
  "JMeter/5.3.1",           // Apache JMeter, a performance testing tool that can also be used maliciously
  "Fiddler/4.6.0.2",        // Fiddler tool, a debugger often used in attacks
  "Thunder Client/3.1.0 (VSCode extension)", // A lightweight API testing tool, could be used in attacks
  "RapidAPI/2.0"            // API marketplace, used to test multiple APIs, potentially for scraping
]
)
const AUTH_SECRET = String(process.env.AUTH_SECRET)
const getPublicAuthToken: RequestHandler = async(req, res, next) => {
    try{
        const origin = req.headers.origin || ''
        const userAgent = String(req.headers["user-agent"])
        if(origin !== (process.env.NODE_ENV === "production"? process.env.CLIENT_URL : "http://localhost:5173")){
            throwError("Forbidden", 403, [{msg: "Unauthorized"}])
            return
        }
        if(blockedUserAgents.has(userAgent) || !userAgent){
            throwError("Forbidden", 403, [{msg: "Unauthorized"}])
            return
        }

        const authToken = jwt.sign({target: "guset"}, AUTH_SECRET, {expiresIn: '15m'})

        res.cookie('__Secure-public-auth.access', authToken, {
            httpOnly: true, 
            secure: true, 
            maxAge: 15 * 1000 * 60, 
            sameSite: "none",
            path: "/",
            domain: process.env.NODE_ENV === "production"? ".hallowedvisions.com" : ""
        })
        res.status(200).json({msg:"hello"})
    } catch(error) {
        next(error)
    }
}

export default getPublicAuthToken