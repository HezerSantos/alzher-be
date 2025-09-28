import { RequestHandler } from "express";
import throwError from "../../helpers/errorHelper";
import dotenv from  'dotenv'
import jwt from "jsonwebtoken";
dotenv.config()
const CSRF_SECRET = String(process.env.CSRF_SECRET)
interface VerifyCsrfType {
    (cookieCsrfToken: string, headerCsrfToken: string): Boolean
}

interface DecodedType {
    csrfToken: string,
    key: number
}

const tokens = [
  '9d1fc7cb742b0a8a0b04bbcb4d3c8c9314a1f4bba332589ecf23be40abf87d3b',
  'd2fdf5e58c6174b64721f77f814823a25cd54d2382e2c5fa112df2c0d00bb687',
  'bd9ebd8e3504f9d8cbd86b31d4e60e9d5e6cf917f3517ae7b1f5abf8785d315e',
  'a2c3d5f2aa509d5a271478f0bba66c37a2c185f9026836bb0d6622304890e2ea',
  'b7e6f3d4d66c8ac352f122b48dc7e3a8ffbeeb3f291b3828f56fd639ba0a8be4',
  '68292c6a3fdc2b9abbb4b949b39d541f1d1bfa565eb2485ea725d4adf96fe994',
  '0f7f8b41771f9f2653d238a55945d1f3a13f2f54a12d43df9ce5f3341aeed4e1',
  'f1a8a74b601a1e6ecb12e2e08329cf2f08ab1fe40e05997b94c43d59c7077bfa',
  '70edc84c41dc91a3f0b8a6d5a26a53b00511c85c05c4e13e064b4a96b37df98a',
  '20e4a6fe8e6f164baf01e96f80a2d25b110d88574d41cde79f5ce86eb2f0f711'
]

type TransformCookieType = (csrfToken: string, key: number) => string

const transformCookie: TransformCookieType = (csrfToken, key) => {
    const mappedToken = Array.from(csrfToken)
    const transformedToken = mappedToken.map((char, index) => {
        return char + tokens[key][index]
    })

    return transformedToken.join("")
}  

const verifyCsrf: VerifyCsrfType = (cookieCsrfToken, headerCsrfToken) => {
    const decoded = jwt.verify(cookieCsrfToken, CSRF_SECRET)
    const csrfCookie = decoded as DecodedType

    const csrfToken = transformCookie(csrfCookie.csrfToken, csrfCookie.key)
    // console.log(csrfToken)
    // console.log()
    // console.log(headerCsrfToken)

    if(headerCsrfToken !== csrfToken){
        return false
    }

    return true
}
const validateCsrf: RequestHandler = (req, res, next) => {
    try{
        const headerCsrfToken = String(req.headers['csrftoken'])
        const cookieCsrfToken = req.cookies['__Secure-auth.csrf']
        if(!headerCsrfToken || !cookieCsrfToken){
            throwError("403 Forbidden", 403, {msg: "Forbidden", code: "INVALID_PERMISSIONS"})
        }

        const match = verifyCsrf(cookieCsrfToken, headerCsrfToken)

        if(!match){
            throwError("403 Forbidden", 403, {msg: "Forbidden", code: "INVALID_PERMISSIONS"})
        }

        next()
    } catch(error){
        next(error)
    }
}

export default validateCsrf