import { body } from "express-validator";

export const howIdentityDocsCheckedValidator = [
    body("howIdentityDocsCheckedRadio", "howIdentityDocsCheckedEmpty").notEmpty()
];
