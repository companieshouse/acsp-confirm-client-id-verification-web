import { body } from "express-validator";

export const identityDocsGroup2Validator = [
    body("documentsGroup2A", "identityDocumentsGroup1Empty").notEmpty(),
    body("documentsGroup2B", "identityDocumentsGroup1Empty").notEmpty()
];
