import { body } from "express-validator";

export const emailValidator = [
    body("email-address").trim().notEmpty().withMessage("noEmailAddress").bail().isEmail().withMessage("invalidEmail"),

    body("confirm").trim().notEmpty().withMessage("noConfirmAddress").bail().custom((value, { req }) => emailChecker(req.body["email-address"], req.body.confirm))
];

export const emailChecker = (emailAddress: string, confirmEmail: string) => {
    emailAddress = emailAddress.trim();
    confirmEmail = confirmEmail.trim();
    if (emailAddress !== confirmEmail) {
        throw new Error("emailAddressDontMatch");
    }
    return true;
};
