import { body } from "express-validator";

export const identityChecksValidator = [
    body("wicc-day").custom((value, { req }) => dateDayChecker(req.body["wicc-day"], req.body["wicc-month"], req.body["wicc-year"])),
    body("wicc-month").custom((value, { req }) => dateMonthChecker(req.body["wicc-day"], req.body["wicc-month"], req.body["wicc-year"])),
    body("wicc-year").custom((value, { req }) => dateYearChecker(req.body["wicc-day"], req.body["wicc-month"], req.body["wicc-year"])),
    body("wicc-day").custom((value, { req }) => validDataChecker(req.body["wicc-day"], req.body["wicc-month"], req.body["wicc-year"]))
];

export const dateDayChecker = (day: string, month: string, year: string) => {
    month = month || "";

    if (day.trim() === "" && month.trim() === "" && year.trim() === "") {
        throw new Error("noData");
    } else if (day.trim() === "" && month.trim() === "") {
        throw new Error("noDayMonth");
    } else if (day.trim() === "" && year.trim() === "") {
        throw new Error("noDayYear");
    } else if (day.trim() === "") {
        throw new Error("noDay");
    }
    return true;
};

export const dateMonthChecker = (day: string, month: string, year: string) => {
    month = month || "";

    if (day.trim() !== "" && month.trim() === "" && year.trim() === "") {
        throw new Error("noMonthYear");
    } else if (day.trim() !== "" && month.trim() === "") {
        throw new Error("noMonth");
    }
    return true;
};

export const dateYearChecker = (day: string, month: string, year: string) => {
    month = month || "";

    if (day.trim() !== "" && month.trim() !== "" && year.trim() === "") {
        throw new Error("noYear");
    }
    return true;
};

export const validDataChecker = (day: string, month: string, year: string) => {
    month = month || "";

    if (day !== "" && month !== "" && year !== "") {
        if (!isNumeric(day) || !isNumeric(month) || !isNumeric(year)) {
            throw new Error("nonNumeric");
        } else if (+month < 1 || +month > 12 || +year < 1000 || +year > 9999 || !isValidDay(+day, +month, +year) || day.length > 2) {
            throw new Error("invalid");
        } else if (!isNotInFuture(+day, +month, +year)) {
            throw new Error("dateInFuture");
        }
    }
    return true;
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

const isNumeric = (number: string): boolean => {
    const regex = /^\d+$/;
    return regex.test(number);
};
