import { body } from "express-validator";

export const selectsignOutValidator = [
    body("signout", "signoutNoInputError").notEmpty()
];
