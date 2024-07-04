import { body } from "express-validator";

export const dateOfBirthValidator = [
    body("dob-day").custom((value, { req }) => dateDayChecker(req.body["dob-day"], req.body["dob-month"], req.body["dob-year"])),
    body("dob-month").custom((value, { req }) => dateMonthChecker(req.body["dob-day"], req.body["dob-month"], req.body["dob-year"])),
    body("dob-year").custom((value, { req }) => dateYearChecker(req.body["dob-day"], req.body["dob-month"], req.body["dob-year"])),
    body("dob-day").custom((value, { req }) => validDataChecker(req.body["dob-day"], req.body["dob-month"], req.body["dob-year"]))
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
        } else if (!isNotTooYoung(+day, +month, +year)) {
            throw new Error("tooYoung");
        } else if (!isNotTooOld(+day, +month, +year)) {
            throw new Error("tooOld");
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

export const isNotTooYoung = (day: number, month: number, year: number): boolean => {
    const currentDate = new Date();
    const inputDate = new Date(year, month - 1, day);
    let age = currentDate.getFullYear() - inputDate.getFullYear();
    if (currentDate.getMonth() < inputDate.getMonth() || (currentDate.getMonth() === inputDate.getMonth() && currentDate.getDate() < inputDate.getDate())) {
        age--;
    }
    return age >= 16;
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
