import { body } from "express-validator";

export const confirmIdentityVerificationValidator = [
    body("declaration", "declarationNotChecked").notEmpty()
];
