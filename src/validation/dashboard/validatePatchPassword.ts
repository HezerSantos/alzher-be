import { body } from "express-validator";

const validatePatchPassword = [
    body("currentPassword")
        .trim()
        .notEmpty(),
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

export default validatePatchPassword