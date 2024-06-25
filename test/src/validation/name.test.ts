import { firstNameChecker, lastNameChecker, middleNameChecker } from "../../../src/validations/personName";

describe("Missing input validation tests", () => {
    test("Error if name fields are completely empty", async () => {
        expect(() => firstNameChecker("", "")).toThrow(new Error("enterFullName"));
    });
    test("Error if first name field is empty", async () => {
        expect(() => firstNameChecker("", "Doe")).toThrow(new Error("enterFirstName"));
    });
    test("Error if last name field is empty", async () => {
        expect(() => lastNameChecker("John", "")).toThrow(new Error("enterLastName"));
    });
    test("No error if first and last name entered", async () => {
        expect(() => lastNameChecker("John", "Doe")).toBeTruthy();
    });
});

describe("Valid data input tests", () => {
    test("Error if first name field is not valid input", async () => {
        expect(() => firstNameChecker("J0hn&/", "Doe")).toThrow(new Error("invalidFirstNameFormat"));
    });
    test("Error if last name field is not valid input", async () => {
        expect(() => lastNameChecker("John", "DO&@")).toThrow(new Error("invalidLastNameFormat"));
    });
    test("Error if middle names field is not valid input", async () => {
        expect(() => middleNameChecker("And?£*")).toThrow(new Error("invalidMiddleNameFormat"));
    });
});
