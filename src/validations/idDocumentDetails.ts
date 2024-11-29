import { body, ValidationChain } from "express-validator";
import { ClientData } from "../model/ClientData";
import { Session } from "@companieshouse/node-session-handler";
import { USER_DATA } from "../utils/constants";

const idDocumentDetailsValidator = (): ValidationChain[] => {
    const documentDetailsValidatorErrors: ValidationChain[] = [];
    const numberOfDocumentDetails = 16;

    for (let i = 1; i <= numberOfDocumentDetails; i++) {
        documentDetailsValidatorErrors.push(
            (
                body(`documentNumber_${i}`)
                    .if(body(`documentNumber_${i}`).exists()).trim().notEmpty().withMessage("docNumberInput")
                    .bail().isLength({ max: 50 }).withMessage("docNumberLength")
                    .bail().isAlphanumeric().withMessage("docNumberFormat")
            ));

        documentDetailsValidatorErrors.push(
            (
                body(`expiryDateDay_${i}`)
                    .if(body(`expiryDateDay_${i}`).exists()).custom((value, { req }) => dateDayChecker(req.body[`expiryDateDay_${i}`], req.body[`expiryDateMonth_${i}`], req.body[`expiryDateYear_${i}`]))
            ));

        documentDetailsValidatorErrors.push(
            (
                body(`expiryDateMonth_${i}`).custom((value, { req }) => dateMonthChecker(req.body[`expiryDateDay_${i}`], req.body[`expiryDateMonth_${i}`], req.body[`expiryDateYear_${i}`]))
            ));

        documentDetailsValidatorErrors.push(
            (
                body(`expiryDateYear_${i}`)
                    .if(body(`expiryDateYear_${i}`).exists()).custom((value, { req }) => dateYearChecker(req.body[`expiryDateDay_${i}`], req.body[`expiryDateMonth_${i}`], req.body[`expiryDateYear_${i}`]))
            ));

        documentDetailsValidatorErrors.push(
            (
                body(`expiryDateDay_${i}`)
                    .if(body(`expiryDateDay_${i}`).exists()).custom((value, { req }) => validDataChecker(req.body[`expiryDateDay_${i}`], req.body[`expiryDateMonth_${i}`], req.body[`expiryDateYear_${i}`], req.session))
            ));

        documentDetailsValidatorErrors.push(
            (
                body(`countryInput_${i}`)
                    .if(body(`countryInput_${i}`).exists()).trim().notEmpty().withMessage("noCountry")
            ));
    }
    return documentDetailsValidatorErrors;
};

export default idDocumentDetailsValidator;

type ValidationType = "expiryDate";

export const dateDayChecker = (day: string, month: string | undefined, year: string): boolean => {
    if (day.trim() === "" && month === undefined && year.trim() === "") {
        throw new Error("noExpiryDate");
    } else if (day.trim() === "" && month === undefined) {
        throw new Error("noExpiryDayMonth");
    } else if (day.trim() === "" && year.trim() === "") {
        throw new Error("noExpiryDayYear");
    } else if (day.trim() === "") {
        throw new Error("noExpiryDay");
    }
    return true;
};

export const dateMonthChecker = (day: string, month: string | undefined, year: string): boolean => {
    if (day !== undefined && year !== undefined) {
        if (day.trim() !== "" && month === undefined && year.trim() === "") {
            throw new Error("noExpiryMonthYear");
        } else if (day.trim() !== "" && (month === undefined || month === "Choose month")) {
            throw new Error("noExpiryMonth");
        }
    }
    return true;
};

export const dateYearChecker = (day: string, month: string | undefined, year: string): boolean => {
    if (day.trim() !== "" && month !== undefined && year.trim() === "") {
        throw new Error("noExpiryYear");
    }
    return true;
};

export const validDataChecker = (day: string, month: string | undefined, year: string, req: Session): boolean => {
    if (day !== "" && month !== undefined && year !== "") {
        validateNumeric(day, month, year);
        validateMonthYearRange(month, year);
        validateDayLength(day, month, year);
        validateAgainstWhenIdDocsChecked(+day, +month, +year, req);
    }
    return true;
};

const validateAgainstWhenIdDocsChecked = (day: number, month: number, year: number, req: Session): void => {
    const clientData: ClientData = req?.getExtraData(USER_DATA)!;
    const whenIdDocsChecked: Date = clientData.whenIdentityChecksCompleted!;
    const expiryDate = new Date(year, month - 1, day);
    if (expiryDate <= whenIdDocsChecked) {
        throw new Error("dateAfterIdChecksDone");
    }
};

const validateNumeric = (day: string, month: string, year: string): void => {
    if (!isNumeric(day) || !isNumeric(month) || !isNumeric(year)) {
        throw new Error("expiryDateNonNumeric");
    }
};

const validateMonthYearRange = (month: string, year: string): void => {
    if (+month < 1 || +month > 12 || +year < 1000 || +year > 9999) {
        throw new Error("expiryDateInvalid");
    }
};

const validateDayLength = (day: string, month: string, year: string): void => {
    if (!isValidDay(+day, +month, +year) || day.length > 2) {
        throw new Error("expiryDateInvalid");
    }
};

const isValidDay = (day: number, month: number, year: number): boolean => {
    const numbDays = new Date(year, month, 0).getDate();
    return day >= 1 && day <= numbDays;
};

const isNumeric = (number: string): boolean => {
    const regex = /^\d+$/;
    return regex.test(number);
};
