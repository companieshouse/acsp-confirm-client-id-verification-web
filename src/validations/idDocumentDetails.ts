import { body, ValidationChain } from "express-validator";

const idDocumentDetailsValidator = (): ValidationChain[] => {
    const documentDetailsValidatorErrors: ValidationChain[] = [];
    const numberOfDocumentDetails = 7;
    for (let i = 1; i <= numberOfDocumentDetails; i++) {
        documentDetailsValidatorErrors.push(
            (
                body(`documentDetails_${i}`)
                    .if(body(`documentDetails_${i}`).exists()).trim().notEmpty().withMessage("Enter the details for the document reference")
                    .bail().isLength({ max: 9 }).withMessage("The document reference must be exactly 9 characters long")
                    .bail().isAlphanumeric().withMessage("The document reference must only include letters and numbers") // Error for non-alphanumeric input
            ));

        documentDetailsValidatorErrors.push(
            (
                body(`expiryDate_${i}`).if(body(`expiryDateDay_${i}`).exists()).custom((value, { req }) => dateDayChecker(req.body[`expiryDateDay_${i}`], req.body[`expiryDateMonth_${i}`], req.body[`expiryDateYear_${1}`], "expiryDate"))
            ));

        documentDetailsValidatorErrors.push(
            (
                body(`expiryDate_${i}`).if(body(`expiryDateMonth_${i}`).exists()).custom((value, { req }) => dateMonthChecker(req.body[`expiryDateDay_${i}`], req.body[`expiryDateMonth_${i}`], req.body[`expiryDateYear_${1}`], "expiryDate"))
            ));

        documentDetailsValidatorErrors.push(
            (
                body(`expiryDate_${i}`).if(body(`expiryDateYear_${i}`).exists()).custom((value, { req }) => dateYearChecker(req.body[`expiryDateDay_${i}`], req.body[`expiryDateMonth_${i}`], req.body[`expiryDateYear_${1}`], "expiryDate"))
            ));

        documentDetailsValidatorErrors.push(
            (
                body(`expiryDate_${i}`).if(body(`expiryDateDay_${i}`).exists()).custom((value, { req }) => validDataChecker(req.body[`expiryDateDay_${i}`], req.body[`expiryDateMonth_${i}`], req.body[`expiryDateYear_${1}`], "expiryDate"))
            ));
    }
    console.log("errors----->", documentDetailsValidatorErrors.length);
    return documentDetailsValidatorErrors;
};

export default idDocumentDetailsValidator;

type ValidationType = "expiryDate";

// export const dateValidator = (type: ValidationType, index: any): ValidationChain[] => [
//     body(`${type}`).custom((value, { req }) => dateDayChecker(req.body[`${type}day-${index}`], req.body[`expiryDateMonth-${index}`], req.body[`${type}year-${index}`], type))
//     // body(`${type}month-${index}`).custom((value, { req }) => dateMonthChecker(req.body[`${type}day-${index}`], req.body[`${type}month-${index}`], req.body[`${type}year-${index}`], type)),
//     // body(`${type}year-${index}`).custom((value, { req }) => dateYearChecker(req.body[`${type}day-${index}`], req.body[`${type}month-${index}`], req.body[`${type}year-${index}`], type)),
//     // body(`${type}day-${index}`).custom((value, { req }) => validDataChecker(req.body[`${type}day-${index}`], req.body[`${type}month-${index}`], req.body[`${type}year-${index}`], type))
// ];

export const dateDayChecker = (day: string, month: string | undefined, year: string, type: ValidationType): boolean => {

    if (day.trim() === "" && month === undefined && year.trim() === "") {
        throw new Error(type === "expiryDate" ? "noData" : "noDataIdentity");
    } else if (day.trim() === "" && month === undefined) {
        throw new Error(type === "expiryDate" ? "noDayMonth" : "noDayMonthIdentity");
    } else if (day.trim() === "" && year.trim() === "") {
        throw new Error(type === "expiryDate" ? "noDayYear" : "noDayYearIdentity");
    } else if (day.trim() === "") {
        throw new Error(type === "expiryDate" ? "noDay" : "noDayIdentity");
    }
    return true;
};

export const dateMonthChecker = (day: string, month: string | undefined, year: string, type: ValidationType): boolean => {

    if (day.trim() !== "" && month === undefined && year.trim() === "") {
        throw new Error(type === "expiryDate" ? "noMonthYear" : "noMonthYearIdentity");
    } else if (day.trim() !== "" && month === undefined) {
        throw new Error(type === "expiryDate" ? "noMonth" : "noMonthIdentity");
    }
    return true;
};

export const dateYearChecker = (day: string, month: string | undefined, year: string, type: ValidationType): boolean => {

    if (day.trim() !== "" && month !== undefined && year.trim() === "") {
        throw new Error(type === "expiryDate" ? "noYear" : "noYearIdentity");
    }
    return true;
};

export const validDataChecker = (day: string, month: string | undefined, year: string, type: ValidationType): boolean => {

    if (day !== "" && month !== undefined && year !== "") {
        validateNumeric(day, month, year, type);
        validateMonthYearRange(month, year, type);
        validateDayLength(day, month, year, type);
        validateDate(day, month, year, type);
        if (type === "expiryDate") {
            validateDobAge(day, month, year);
        }
    }
    return true;
};

const validateNumeric = (day: string, month: string, year: string, type: ValidationType): void => {
    if (!isNumeric(day) || !isNumeric(month) || !isNumeric(year)) {
        throw new Error(type === "expiryDate" ? "nonNumeric" : "nonNumericIdentity");
    }
};

const validateMonthYearRange = (month: string, year: string, type: ValidationType): void => {
    if (+month < 1 || +month > 12 || +year < 1000 || +year > 9999) {
        throw new Error(type === "expiryDate" ? "invalid" : "invalidIdentity");
    }
};

const validateDayLength = (day: string, month: string, year: string, type: ValidationType): void => {
    if (!isValidDay(+day, +month, +year) || day.length > 2) {
        throw new Error(type === "expiryDate" ? "invalid" : "invalidIdentity");
    }
};

const validateDate = (day: string, month: string, year: string, type: ValidationType): void => {
    if (!isNotInFuture(+day, +month, +year)) {
        throw new Error(type === "expiryDate" ? "dateInFuture" : "dateInFutureIdentity");
    }
};

const validateDobAge = (day: string, month: string, year: string): void => {
    if (!isNotTooYoung(+day, +month, +year)) {
        throw new Error("tooYoung");
    }
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
