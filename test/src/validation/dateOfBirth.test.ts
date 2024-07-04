import { dateDayChecker, dateMonthChecker, dateYearChecker, validDataChecker } from "../../../src/validations/dateOfBirth";

describe("Missing input validation tests", () => {
    test("Error if date field is completely empty", async () => {
        expect(() => dateDayChecker("", "", "")).toThrow(new Error("noData"));
    });
    test("Error if day and month fields are empty", async () => {
        expect(() => dateDayChecker("", "", "1999")).toThrow(new Error("noDayMonth"));
    });
    test("Error if day and year fields are empty", async () => {
        expect(() => dateDayChecker("", "02", "")).toThrow(new Error("noDayYear"));
    });
    test("Error if month and year fields are empty", async () => {
        expect(() => dateMonthChecker("11", "", "")).toThrow(new Error("noMonthYear"));
    });
    test("Error if day field is empty", async () => {
        expect(() => dateDayChecker("", "02", "1999")).toThrow(new Error("noDay"));
    });
    test("Error if Month field is empty", async () => {
        expect(() => dateMonthChecker("11", "", "1999")).toThrow(new Error("noMonth"));
    });
    test("Error if Year field is empty", async () => {
        expect(() => dateYearChecker("11", "02", "")).toThrow(new Error("noYear"));
    });

    test("No error if all fields are input", async () => {
        expect(() => dateYearChecker("11", "02", "1999")).toBeTruthy();
    });
});

describe("Valid data input tests", () => {
    test("Error if year is greater than 9999", async () => {
        expect(() => validDataChecker("11", "13", "99999")).toThrow(new Error("invalid"));
    });
    test("Error if year is less than 1000", async () => {
        expect(() => validDataChecker("11", "13", "999")).toThrow(new Error("invalid"));
    });
    test("Error if day is not valid", async () => {
        expect(() => validDataChecker("30", "02", "1999")).toThrow(new Error("invalid"));
    });
    test("Error if date given is in the future", async () => {
        expect(() => validDataChecker("30", "11", "3490")).toThrow(new Error("dateInFuture"));
    });
    test("Error if date given is more than 110 years ago", async () => {
        expect(() => validDataChecker("30", "11", "1490")).toThrow(new Error("tooOld"));
    });
    test("Error if date given is less than 16 ago", async () => {
        expect(() => validDataChecker("29", "01", "2024")).toThrow(new Error("tooYoung"));
    });
    test("Error if date given is non-numeric", async () => {
        expect(() => validDataChecker("a", "01", "2024")).toThrow(new Error("nonNumeric"));
    });
});

describe("Additional test cases", () => {
    test("Error if day length is more than 2 digits", () => {
        expect(() => validDataChecker("123", "01", "2024")).toThrow(new Error("invalid"));
    });
    test("Error if month is zero", () => {
        expect(() => validDataChecker("11", "00", "1999")).toThrow(new Error("invalid"));
    });
    test("Error if day is zero", () => {
        expect(() => validDataChecker("00", "01", "1999")).toThrow(new Error("invalid"));
    });
    test("Leap year test: valid leap day", () => {
        expect(() => validDataChecker("29", "02", "2020")).toBeTruthy();
    });
    test("Leap year test: invalid leap day", () => {
        expect(() => validDataChecker("29", "02", "2019")).toThrow(new Error("invalid"));
    });
    test("Boundary test: 110 years ago exactly", () => {
        const currentDate = new Date();
        const year = currentDate.getFullYear() - 110;
        const month = (`0${currentDate.getMonth() + 1}`).slice(-2); 
        const day = (`0${currentDate.getDate()}`).slice(-2); 
        expect(() => validDataChecker(day, month, year.toString())).toBeTruthy();
    });
    test("Boundary test: 16 years ago exactly", () => {
        const currentDate = new Date();
        const year = currentDate.getFullYear() - 16;
        const month = (`0${currentDate.getMonth() + 1}`).slice(-2); 
        const day = (`0${currentDate.getDate()}`).slice(-2); 
        expect(() => validDataChecker(day, month, year.toString())).toBeTruthy();
    });
});
