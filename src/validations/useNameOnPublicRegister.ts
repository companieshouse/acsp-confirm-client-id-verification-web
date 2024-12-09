import { body } from "express-validator";

export const useNameOnPublicRegisterValidator = [
    body("useNameOnPublicRegisterRadio", "useNameOnPublicRegisterNoRadioBtnSelected").notEmpty()
];
