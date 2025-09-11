import { body, ValidationChain } from "express-validator";

export const identityDocsGroup2Validator: ValidationChain[] = [
    body("documentsGroup2A")
        .custom((value, { req }) => {

            let documentsGroup2A: any[] = [];
            let documentsGroup2B: any[] = [];

            if (req.body.documentsGroup2A === undefined) {
                documentsGroup2A = [];
            } else if (Array.isArray(req.body.documentsGroup2A)) {
                documentsGroup2A = req.body.documentsGroup2A;
            } else {
                documentsGroup2A = [req.body.documentsGroup2A];
            }

            if (req.body.documentsGroup2B === undefined) {
                documentsGroup2B = [];
            } else if (Array.isArray(req.body.documentsGroup2B)) {
                documentsGroup2B = req.body.documentsGroup2B;
            } else {
                documentsGroup2B = [req.body.documentsGroup2B];
            }

            if (documentsGroup2A.length === 0 && documentsGroup2B.length === 0) {
                if (req.originalUrl && req.originalUrl.includes("reverify")) {
                    throw new Error("reverifyIdentityDocumentsGroup1Empty");
                } else {
                    throw new Error("identityDocumentsGroup1Empty");
                }
            }
            if (documentsGroup2B.length !== 0 && documentsGroup2A.length === 0) {
                throw new Error("identityDocumentsGroupANotSelected");
            }
            if ((documentsGroup2B.length + documentsGroup2A.length) < 2) {
                throw new Error("identityDocumentsNo2Selection");
            }
            return true;

        })

];
