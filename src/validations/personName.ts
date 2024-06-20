import { body } from "express-validator";

export const nameValidator = [
    body("first-name").custom((value, { req }) => firstNameChecker(req.body["first-name"], req.body["last-name"])).bail().isLength({ max: 50 }).withMessage("invalidFirstNameLength"),
    body("middle-names").custom((value, { req }) => middleNameChecker(req.body["middle-names"])).bail().isLength({ max: 50 }).withMessage("invalidMiddleNameLength"),
    body("last-name").custom((value, { req }) => lastNameChecker(req.body["first-name"], req.body["last-name"])).bail().isLength({ max: 160 }).withMessage("invalidLastNameLength")
];

export const firstNameChecker = (firstName: string, lastName: string) => {
    firstName = firstName.trim();
    lastName = lastName.trim();
    if (firstName === "" && lastName === "") {
        throw new Error("enterFullName");
    } else if (firstName === "" && lastName !== "") {
        throw new Error("enterFirstName");
    } else if (firstName !== "" && !isValidName(firstName)) {
        throw new Error("invalidFirstNameFormat");
    }
    return true;
};

export const lastNameChecker = (firstName: string, lastName: string) => {
    firstName = firstName.trim();
    lastName = lastName.trim();
    if (firstName !== "" && lastName === "") {
        throw new Error("enterLastName");
    } else if (lastName !== "" && !isValidName(lastName)) {
        throw new Error("invalidLastNameFormat");
    }
    return true;
};

export const middleNameChecker = (middleName: string) => {
    middleName = middleName.trim();
    if (middleName !== "" && !isValidName(middleName)) {
        throw new Error("invalidMiddleNameFormat");
    }
    return true;
};

export const isValidName = (name: string): boolean => {
    const regex = /^[a-zA-Z \-']+$/ig;
    return regex.test(name);
};
