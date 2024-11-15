import { body, ValidationChain } from "express-validator";
import countryList from "../lib/countryList";
import { ClientData } from "../model/ClientData";
import { Session } from "@companieshouse/node-session-handler";
import { USER_DATA } from "../utils/constants";
import { NextFunction, Request, Response } from "express";
import { FormatService } from "../services/formatService";
import { getLocalesService, selectLang } from "../utils/localise";

const docCount: number = 0;
const idDocumentDetailsValidator = (): ValidationChain[] => {
    const documentDetailsValidatorErrors: ValidationChain[] = [];
    const numberOfDocumentDetails = 16;

    body(`documentNumber_1`).custom((value, { req }) => findDocCount(req.session, docCount));
    console.log("doc count------>", docCount);

    for (let i = 1; i <= numberOfDocumentDetails; i++) {
        documentDetailsValidatorErrors.push(
            (
                body(`documentNumber_${i}`)
                    .if(body(`documentNumber_${i}`).exists()).trim().notEmpty().withMessage("docNumberInput")
                    .bail().isLength({ max: 9 }).withMessage("docNumberLength")
                    .bail().isAlphanumeric().withMessage("docNumberFormat")
            ));

        if (body(`expiryDateDay_${i}`).exists()) {
            documentDetailsValidatorErrors.push(
                (
                    body(`expiryDateDay_${i}`).custom((value, { req }) => dateDayChecker(req.body[`expiryDateDay_${i}`], req.body[`expiryDateMonth_${i}`], req.body[`expiryDateYear_${i}`], "expiryDate"))
                ));
        }

        if (body(`expiryDateMonth_${i}`).exists()) {
            documentDetailsValidatorErrors.push(
                (
                    body(`expiryDateMonth_${i}`).custom((value, { req }) => dateMonthChecker(req.body[`expiryDateDay_${i}`], req.body[`expiryDateMonth_${i}`], req.body[`expiryDateYear_${i}`], "expiryDate"))
                ));
        }

        if (body(`expiryDateYear_${i}`).exists()) {
            documentDetailsValidatorErrors.push(
                (
                    body(`expiryDateYear_${i}`).custom((value, { req }) => dateYearChecker(req.body[`expiryDateDay_${i}`], req.body[`expiryDateMonth_${i}`], req.body[`expiryDateYear_${i}`], "expiryDate"))
                ));
        }

        if (body(`expiryDateDay_${i}`).exists()) {
            documentDetailsValidatorErrors.push(
                (
                    body(`expiryDateDay_${i}`).custom((value, { req }) => validDataChecker(req.body[`expiryDateDay_${i}`], req.body[`expiryDateMonth_${i}`], req.body[`expiryDateYear_${i}`], req.body[`expiryDate_${i}`], "expiryDate", req.session))
                ));
        }

        if (body(`countryInput_${i}`).exists()) {
            documentDetailsValidatorErrors.push(
                (
                    body(`countryInput_${i}`).trim().custom((value, { req }) => test(req.body[`countryInput_${i}`]))
                ));
        }
    }
    return documentDetailsValidatorErrors;
};

export default idDocumentDetailsValidator;

type ValidationType = "expiryDate";

export const findDocCount = (session:Session, docCount: number) => {
    const clientData: ClientData = session.getExtraData(USER_DATA)!;
    const locales = getLocalesService();
    const formattedDocumentsChecked = FormatService.formatDocumentsCheckedText(
        clientData.documentsChecked,
        locales.i18nCh.resolveNamespacesKeys("en")
    );
    docCount = formattedDocumentsChecked.length;
};

export const test = (ip: string): boolean => {
    console.log("country input------->", ip);
    if (ip === "") {
        throw new Error("noCountry");
    }
    return true;
};

export const validDataChecker = (day: string, month: string | undefined, year: string, expiryDate: Date, type: ValidationType, req: Session): boolean => {
    if (day !== undefined && year !== undefined) {
        if (day !== "" && month !== undefined && year !== "") {
            validateNumeric(day, month, year, type);
            validateMonthYearRange(month, year, type);
            validateDayLength(day, month, year, type);
            if (type === "expiryDate") {
                validateAgainstWhenIdDocsChecked(day, month, year, req, expiryDate);
            }
        }
    }
    return true;
};

const validateAgainstWhenIdDocsChecked = (day: string, month: string, year: string, req: Session, expiryDate:Date): void => {
    const clientData: ClientData = req?.getExtraData(USER_DATA)!;
    const whenIdDocsChecked: Date = clientData.whenIdentityChecksCompleted!;

    expiryDate = new Date(Number(day), Number(month), Number(year));
    if (expiryDate <= whenIdDocsChecked) {
        throw new Error("dateAfterIdChecksDone");
    }
};

export const dateDayChecker = (day: string, month: string | undefined, year: string, type: ValidationType): boolean => {
    if (day !== undefined && year !== undefined) {
        if (day.trim() === "" && month === undefined && year.trim() === "") {
            throw new Error(type === "expiryDate" ? "noExpiryDate" : "noDataIdentity");
        } else if (day.trim() === "" && month === undefined) {
            throw new Error(type === "expiryDate" ? "noExpiryDayMonth" : "noDayMonthIdentity");
        } else if (day.trim() === "" && year.trim() === "") {
            throw new Error(type === "expiryDate" ? "noExpiryDayYear" : "noDayYearIdentity");
        } else if (day.trim() === "") {
            throw new Error(type === "expiryDate" ? "noExpiryDay" : "noDayIdentity");
        }
    }
    return true;
};

export const dateMonthChecker = (day: string, month: string | undefined, year: string, type: ValidationType): boolean => {
    if (day !== undefined && year !== undefined) {
        if (day.trim() !== "" && month === undefined && year.trim() === "") {
            throw new Error(type === "expiryDate" ? "noExpiryMonthYear" : "noMonthYearIdentity");
        } else if (day.trim() !== "" && (month === undefined || month === "Choose month")) {
            throw new Error(type === "expiryDate" ? "noExpiryMonth" : "noMonthIdentity");
        }
    }
    return true;
};

export const dateYearChecker = (day: string, month: string | undefined, year: string, type: ValidationType): boolean => {
    if (day !== undefined && year !== undefined) {
        if (day.trim() !== "" && month !== undefined && year.trim() === "") {
            throw new Error(type === "expiryDate" ? "noExpiryYear" : "noYearIdentity");
        }
    }
    return true;
};

const validateNumeric = (day: string, month: string, year: string, type: ValidationType): void => {
    if (!isNumeric(day) || !isNumeric(month) || !isNumeric(year)) {
        throw new Error(type === "expiryDate" ? "expiryDateNonNumeric" : "nonNumericIdentity");
    }
};

const validateMonthYearRange = (month: string, year: string, type: ValidationType): void => {
    if (+month < 1 || +month > 12 || +year < 1000 || +year > 9999) {
        throw new Error(type === "expiryDate" ? "expiryDateInvalid" : "invalidIdentity");
    }
};

const validateDayLength = (day: string, month: string, year: string, type: ValidationType): void => {
    if (!isValidDay(+day, +month, +year) || day.length > 2) {
        throw new Error(type === "expiryDate" ? "expiryDateInvalid" : "invalidIdentity");
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

// export const isNotTooYoung = (day: number, month: number, year: number): boolean => {
//     const currentDate = new Date();
//     const inputDate = new Date(year, month - 1, day);
//     let age = currentDate.getFullYear() - inputDate.getFullYear();
//     if (currentDate.getMonth() < inputDate.getMonth() || (currentDate.getMonth() === inputDate.getMonth() && currentDate.getDate() < inputDate.getDate())) {
//         age--;
//     }
//     return age >= 16;
// };
// export const isNotTooOld = (day: number, month: number, year: number): boolean => {
//     const currentDate = new Date();
//     const inputDate = new Date(year, month - 1, day);
//     let age = currentDate.getFullYear() - inputDate.getFullYear();
//     if (currentDate.getMonth() > inputDate.getMonth() || (currentDate.getMonth() === inputDate.getMonth() && currentDate.getDate() > inputDate.getDate())) {
//         age++;
//     }
//     return age <= 110;
// };
// const validateDate = (day: string, month: string, year: string, type: ValidationType): void => {
//     if (!isNotInFuture(+day, +month, +year)) {
//         throw new Error(type === "expiryDate" ? "dateInFuture" : "dateInFutureIdentity");
//     }
// };
// const validateDobAge = (day: string, month: string, year: string): void => {
//     if (!isNotTooYoung(+day, +month, +year)) {
//         throw new Error("tooYoung");
//     }
//     if (!isNotTooOld(+day, +month, +year)) {
//         throw new Error("tooOld");
//     }
// };
// const isNotInFuture = (day: number, month: number, year: number): boolean => {
//     const currentDate = new Date();
//     const inputDate = new Date(year, month - 1, day);
//     return inputDate <= currentDate;
// };
