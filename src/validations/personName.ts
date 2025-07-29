import { body } from "express-validator";
import { LETTERS, NUMBERS, PUNCTUATION, SYMBOLS, WHITESPACE } from "./regexParts";

const extendedNamePattern = `^[${LETTERS}${NUMBERS}${PUNCTUATION}${SYMBOLS}${WHITESPACE}]*$`;
const extendedNameFormat: RegExp = new RegExp(extendedNamePattern, "u");

export const nameValidator = [
    body("first-name").trim().notEmpty().withMessage("enterFirstName").bail().matches(extendedNameFormat).withMessage("invalidFirstNameFormat").bail().isLength({ max: 50 }).withMessage("invalidFirstNameLength"),
    body("middle-names").trim().matches(extendedNameFormat).withMessage("invalidMiddleNameFormat").bail().isLength({ max: 50 }).withMessage("invalidMiddleNameLength"),
    body("last-name").trim().notEmpty().withMessage("enterLastName").bail().matches(extendedNameFormat).withMessage("invalidLastNameFormat").bail().isLength({ max: 160 }).withMessage("invalidLastNameLength")
];
