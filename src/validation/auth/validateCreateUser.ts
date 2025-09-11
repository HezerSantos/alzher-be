import { body } from "express-validator";
import prisma from "../../config/prisma";

const validateCreateUser = [
    body("email")
        .trim()
        .notEmpty()
        .normalizeEmail()
        .isEmail().withMessage("Invalid email")
        .custom(async(value, {req}) => {
            const user = await prisma.user.findUnique({
                where: {
                    email: value
                }
            })

            if(user){
                throw new Error("Email Exists")
            }
            return true
        }),
    body("password")
        .trim()
        .notEmpty()
        .isLength({min: 3}).withMessage("Password must be at least 12 characters"),
    body("confirmPassword")
        .trim()
        .notEmpty().withMessage("Password must be present")
        .custom((value, { req }) => {
            const password = req.body.password
            if(password !== value){
                throw new Error("Passwords do not Match")
            }
            return true
        })
]

export default validateCreateUser