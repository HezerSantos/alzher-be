import { body } from "express-validator";
import prisma from "../../config/prisma";
const validatePatchEmail = [
    body("password")
        .trim()
        .notEmpty(),
    body("newEmail")
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
]

export default validatePatchEmail