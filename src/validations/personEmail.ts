import { body } from "express-validator";

export const emailValidator = [
    body("email-address").trim().notEmpty().withMessage("noEmailAddress").bail().isEmail().withMessage("invalidEmail")
];
