import { body } from "express-validator";
import { EXCLUDED_CHARS, LETTERS, NUMBERS, PUNCTUATION, SYMBOLS, WHITESPACE } from "./regexParts";

const extendedAddressDetailsPattern = `^(?!.*[${EXCLUDED_CHARS}])[${LETTERS}${NUMBERS}${PUNCTUATION}${SYMBOLS}${WHITESPACE}]*$`;
const extendedAddressDetailsFormat: RegExp = new RegExp(extendedAddressDetailsPattern, "u");
export const personalCodeValidator = [
    body("personalCode").trim().notEmpty().withMessage("noPersonalCode").bail(),
    body("personalCode").trim().matches(extendedAddressDetailsFormat).withMessage("personalCodeInvalidFormat").bail()
];
