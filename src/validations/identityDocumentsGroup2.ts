import { body } from "express-validator";

export const identityDocsGroup2Validator = [
    body("documentsGroup2", "identityDocumentsGroup1Empty").notEmpty(),
    body("documentsGroup3", "identityDocumentsGroup1Empty").notEmpty()
];
