import { body } from "express-validator";

export const howIdentityDocsCheckedValidator = [
    body("howIdentityDocsCheckedRadio", "howIdentityDocsCheckedEmpty").notEmpty()
];

export const reverifyHowIdentityDocsCheckedValidator = [
    body("howIdentityDocsCheckedRadio", "reverifyHowIdentityDocsCheckedEmpty").notEmpty()
];
