import { body } from "express-validator";

const extendedAddressDetailsPattern = /^[A-Z0-9]{11}$/;
const extendedAddressDetailsFormat: RegExp = new RegExp(extendedAddressDetailsPattern, "u");

export const personalCodeValidator = [
    body("personalCode").trim().notEmpty().withMessage("noPersonalCode").bail().matches(extendedAddressDetailsFormat).withMessage("personalCodeInvalidFormat")
];
