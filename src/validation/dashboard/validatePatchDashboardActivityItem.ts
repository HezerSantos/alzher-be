import { body } from 'express-validator'


const categorySet = new Set([
    "Merchandise",
    "Entertainment",
    "Subscriptions",
    "Dining",
    "Grocery",
    "Transportation",
    "Bills"
])

const validatePatchDashboardActivityItem = [
     body("category")
        .trim()
        .notEmpty()
        .custom((value) => {
            if(!categorySet.has(value)){
                throw new Error("Invalid Category")
            }
            return true
        }),
    body("description")
        .trim()
        .notEmpty().withMessage("Description is required"),
    body("transactionDate")
        .trim()
        .notEmpty().withMessage("Transaction date is required")
        .custom((value) => {
            const regex = /^([1-9]|1[0-2])\/([1-9]|[12][0-9]|3[01])\/\d{4}$/;
            if (!regex.test(value)) {
                throw new Error("Transaction date must be in M/D/YYYY format");
            }
            return true;
        }),
    body("transactionAmount")
        .trim()
        .notEmpty()
        .isNumeric().withMessage("Invalid Amount")
]

export default validatePatchDashboardActivityItem