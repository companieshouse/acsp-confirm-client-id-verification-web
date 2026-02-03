import { Session } from "@companieshouse/node-session-handler";
import { body, ValidationChain } from "express-validator";
import { ClientData } from "../model/ClientData";
import { USER_DATA } from "../utils/constants";

type ValidationType = "dob" | "wicc";

export const dateValidator = (type: ValidationType): ValidationChain[] => [
    body(`${type}-day`).custom((value, { req }) => dateDayChecker(req.body[`${type}-day`], req.body[`${type}-month`], req.body[`${type}-year`], type)),
    body(`${type}-month`).custom((value, { req }) => dateMonthChecker(req.body[`${type}-day`], req.body[`${type}-month`], req.body[`${type}-year`], type)),
    body(`${type}-year`).custom((value, { req }) => dateYearChecker(req.body[`${type}-day`], req.body[`${type}-month`], req.body[`${type}-year`], type)),
    body(`${type}-day`).custom((value, { req }) => validDataChecker(req.body[`${type}-day`], req.body[`${type}-month`], req.body[`${type}-year`], type, req.session))
];

export const dateDayChecker = (day: string, month: string, year: string, type: ValidationType): boolean => {

    if (day.trim() === "" && month.trim() === "" && year.trim() === "") {
        throw new Error(type === "dob" ? "noData" : "noDataIdentity");
    } else if (day.trim() === "" && month.trim() === "") {
        throw new Error(type === "dob" ? "noDayMonth" : "noDayMonthIdentity");
    } else if (day.trim() === "" && year.trim() === "") {
        throw new Error(type === "dob" ? "noDayYear" : "noDayYearIdentity");
    } else if (day.trim() === "") {
        throw new Error(type === "dob" ? "noDay" : "noDayIdentity");
    }
    return true;
};

export const dateMonthChecker = (day: string, month: string, year: string, type: ValidationType): boolean => {
    if (day.trim() !== "" && month.trim() === "" && year.trim() === "") {
        throw new Error(type === "dob" ? "noMonthYear" : "noMonthYearIdentity");
    } else if (day.trim() !== "" && month.trim() === "") {
        throw new Error(type === "dob" ? "noMonth" : "noMonthIdentity");
    }

    return true;
};

export const dateYearChecker = (day: string, month: string, year: string, type: ValidationType): boolean => {

    if (day.trim() !== "" && month.trim() !== "" && year.trim() === "") {
        throw new Error(type === "dob" ? "noYear" : "noYearIdentity");
    }
    return true;
};

export const validDataChecker = (day: string, month: string, year: string, type: ValidationType, req: Session): boolean => {

    if (day !== "" && month.trim() !== "" && year !== "") {
        validateNumeric(day, month, year, type);
        validateMonthYearRange(month, year, type);
        validateDayLength(day, month, year, type);
        validateDate(day, month, year, type);
        if (type === "dob") {
            validateDobAge(day, month, year);
        } else if (type === "wicc") {
            validateWiccAgainstDob(+day, +month, +year, req);
        }
    }
    return true;
};

const validateWiccAgainstDob = (day: number, month: number, year: number, req: Session): void => {
    const clientData: ClientData = req?.getExtraData(USER_DATA)!;
    const dob:Date = new Date(clientData.dateOfBirth!);
    const wicc = new Date(year, month - 1, day);

    if (wicc <= dob) {
        throw new Error("dateAfterDob");
    }
};

const validateNumeric = (day: string, month: string, year: string, type: ValidationType): void => {
    if (!isNumeric(day) || !isNumeric(month) || !isNumeric(year)) {
        throw new Error(type === "dob" ? "nonNumeric" : "nonNumericIdentity");
    }
};

const validateMonthYearRange = (month: string, year: string, type: ValidationType): void => {
    if (+month < 1 || +month > 12 || +year < 1000 || +year > 9999) {
        throw new Error(type === "dob" ? "invalid" : "invalidIdentity");
    }
};

const validateDayLength = (day: string, month: string, year: string, type: ValidationType): void => {
    if (!isValidDay(+day, +month, +year) || day.length > 2) {
        throw new Error(type === "dob" ? "invalid" : "invalidIdentity");
    }
};

const validateDate = (day: string, month: string, year: string, type: ValidationType): void => {
    if (!isNotInFuture(+day, +month, +year)) {
        throw new Error(type === "dob" ? "dateInFuture" : "dateInFutureIdentity");
    }
};

const validateDobAge = (day: string, month: string, year: string): void => {
    if (!isNotTooOld(+day, +month, +year)) {
        throw new Error("tooOld");
    }
};

const isValidDay = (day: number, month: number, year: number): boolean => {
    const numbDays = new Date(year, month, 0).getDate();
    return day >= 1 && day <= numbDays;
};

const isNotInFuture = (day: number, month: number, year: number): boolean => {
    const currentDate = new Date();
    const inputDate = new Date(year, month - 1, day);
    return inputDate <= currentDate;
};

export const isNotTooOld = (day: number, month: number, year: number): boolean => {
    const currentDate = new Date();
    const inputDate = new Date(year, month - 1, day);
    let age = currentDate.getFullYear() - inputDate.getFullYear();
    if (currentDate.getMonth() > inputDate.getMonth() || (currentDate.getMonth() === inputDate.getMonth() && currentDate.getDate() > inputDate.getDate())) {
        age++;
    }
    return age <= 110;
};

const isNumeric = (number: string): boolean => {
    const regex = /^\d+$/;
    return regex.test(number);
};
