import { body } from "express-validator";

const validateLoginUser = [
    body("email")
        .trim()
        .notEmpty()
        .normalizeEmail()
        .isEmail(),
    body("password")
        .trim()
        .notEmpty()
]

export default validateLoginUser