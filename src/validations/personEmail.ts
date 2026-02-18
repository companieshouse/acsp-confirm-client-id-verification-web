import { body } from "express-validator";

export const emailValidator = [
    body("email-address").trim().notEmpty().withMessage("noEmailAddress").bail().isEmail().withMessage("invalidEmail")
];

export const confirmEmailValidator = [
    body("confirm-email-address").equals("true").withMessage("unconfirmedEmail")
];
