import { body } from "express-validator";

export const emailValidator = [
    body("email-address").trim().notEmpty().withMessage("noEmailAddress").bail().isEmail().withMessage("invalidEmail"),

    body("confirm").trim().notEmpty().withMessage("noConfirmAddress").bail().custom((value, { req }) => emailChecker(req.body["email-address"], req.body.confirm))
];

export const confirmEmailValidator = [
    body("confirm-email-address").equals("true").withMessage("unconfirmedEmail")
];
