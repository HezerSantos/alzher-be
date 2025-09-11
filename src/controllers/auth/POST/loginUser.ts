import { RequestHandler } from "express";
import validateLoginUser from "../../../validation/auth/validateLoginUser";
import { validationResult } from "express-validator";
import throwError from "../../../helpers/errorHelper";
import prisma from "../../../config/prisma";
import argon2 from "argon2";


type AuthenticateUserType = (
    email: string,
    password: string
) => Promise<boolean>

const authenticateUser: AuthenticateUserType = async(email, password) => {
    let match
    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    })

    if(!user){
        throwError("Auth Error", 401, [{ msg: "Invalid Username or Password"}])
    }

    if(user){
        match = await argon2.verify(user.password, password)
    }

    if(match){
        return true
    } else {
        return false
    }
}
const loginUser: RequestHandler[] = [
    ...validateLoginUser,
    async(req, res, next) => {
        try{
            const errors = validationResult(req)

            if(!errors.isEmpty()) {
                throwError("Invalid username or password", 400, { errors: errors.array() })
            }

            const email = req.body.email
            const password = req.body.password

            const match = await authenticateUser(email, password)

            if(!match){
                throwError("Auth Error", 401, [{ msg: "Invalid Username or Password"}])
            }
            
            console.log("login")
            res.json({
                data: "success"
            })
        } catch(error) {
            next(error)
        }
    }
]

export default loginUser

/*

import { betterAuth } from "better-auth";
import { betterPrismaAdapter } from "better-auth/adapter-prisma";
import prisma from "./prisma";

export const auth = betterAuth({
  database: betterPrismaAdapter(prisma),
  token: {
    strategy: "jwt",
    jwt: {
      secret: process.env.JWT_SECRET || "your-super-secret",
      expiresIn: "1h",
    },
  },
  // no `hash` here since you handle hashing yourself
});


const token = await auth.api.createToken({ userId: user.id });

import { fromNodeHeaders } from "better-auth/node";

// inside your route handler, e.g. Express
const session = await auth.api.getSession({
  headers: fromNodeHeaders(req.headers),
});

if (!session) {
  // token invalid or missing
  return res.status(401).json({ error: "Unauthorized" });
}

*/