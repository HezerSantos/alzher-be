import { RequestHandler } from "express";
import validateLoginUser from "../../../validation/auth/validateLoginUser";

const loginUser: RequestHandler[] = [
    ...validateLoginUser,
    async(req, res, next) => {
        try{

        } catch(error) {
            next(error)
        }
    }
]

export default loginUser