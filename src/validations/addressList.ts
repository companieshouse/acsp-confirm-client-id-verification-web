import { body } from "express-validator";

export const addressListValidator = [
    body("homeAddress", "addressListNoRadioBtnSelected").notEmpty()
];
