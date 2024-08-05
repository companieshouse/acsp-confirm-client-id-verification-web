import { body } from "express-validator";

export const checkYourAnswerValidator = [
    body("checkYourAnswerDeclaration", "checkYourAnswerEmpty").notEmpty()
];
