import { body } from "express-validator";

export const identityDocsGroup1Validator = [
    body("documentsGroup1", "identityDocumentsGroup1Empty").notEmpty()
];

export const reverifyIdentityDocsGroup1Validator = [
    body("documentsGroup1", "reverifyIdentityDocumentsGroup1Empty").notEmpty()
];
