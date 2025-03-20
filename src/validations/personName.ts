import { body } from "express-validator";

const nameFormat: RegExp = /^[a-zA-Z \-']*$/ig;

export const nameValidator = [
    body("first-name").trim().notEmpty().withMessage("enterFirstName").bail().matches(nameFormat).withMessage("invalidFirstNameFormat").bail().isLength({ max: 50 }).withMessage("invalidFirstNameLength"),
    body("middle-names").trim().matches(nameFormat).withMessage("invalidMiddleNameFormat").bail().isLength({ max: 50 }).withMessage("invalidMiddleNameLength"),
    body("last-name").trim().notEmpty().withMessage("enterLastName").bail().matches(nameFormat).withMessage("invalidLastNameFormat").bail().isLength({ max: 160 }).withMessage("invalidLastNameLength")
];
