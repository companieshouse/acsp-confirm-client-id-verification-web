import { ValidationChain } from "express-validator";
import idDocumentDetailsValidator, {
    dateDayChecker,
    dateMonthChecker,
    dateYearChecker,
    validDataChecker,
    validateAgainstWhenIdDocsChecked
} from "../../../src/validations/idDocumentDetails";
import { Session } from "@companieshouse/node-session-handler";
import { USER_DATA } from "../../../src/utils/constants";
import { getSessionRequestWithPermission } from "../../mocks/session.mock";
import { ClientData } from "../../../src/model/ClientData";

describe("idDocumentDetailsValidator", () => {
    it("should return an array of ValidationChain objects", () => {
        const validationChains: ValidationChain[] = idDocumentDetailsValidator();
        expect(Array.isArray(validationChains)).toBeTruthy();
        validationChains.forEach((validationChain) => {
            expect(validationChain).toBeInstanceOf(Function);
        });
    });
});

describe("Missing input validation tests", () => {
    test("Error if date field is completely empty", () => {
        expect(() => dateDayChecker("", undefined, "")).toThrow(new Error("noExpiryDate"));
    });

    test("Error if day and month fields are empty", () => {
        expect(() => dateDayChecker("", undefined, "1999")).toThrow(new Error("noExpiryDayMonth"));
    });

    test("Error if day and year fields are empty", () => {
        expect(() => dateDayChecker("", "02", "")).toThrow(new Error("noExpiryDayYear"));
    });

    test("Error if month and year fields are empty", () => {
        expect(() => dateMonthChecker("11", undefined, "")).toThrow(new Error("noExpiryMonthYear"));
    });

    test("Error if day field is empty", () => {
        expect(() => dateDayChecker("", "02", "1999")).toThrow(new Error("noExpiryDay"));
    });

    test("Error if month field is empty", () => {
        expect(() => dateMonthChecker("11", undefined, "1999")).toThrow(new Error("noExpiryMonth"));
    });

    test("Error if year field is empty", () => {
        expect(() => dateYearChecker("11", "02", "")).toThrow(new Error("noExpiryYear"));
    });

    test("No error if all fields are input", () => {
        expect(() => dateDayChecker("11", "02", "1999")).toBeTruthy();
        expect(() => dateMonthChecker("11", "02", "1999")).toBeTruthy();
        expect(() => dateYearChecker("11", "02", "1999")).toBeTruthy();
    });
});

describe("Valid data input tests", () => {
    const session: Session = "" as any as Session;
    test("Error if year is greater than 9999", () => {
        expect(() => validDataChecker("11", "11", "10000", 1, session)).toThrow(new Error("expiryDateInvalid"));
    });

    test("Error if year is less than 1970", () => {
        expect(() => validDataChecker("11", "11", "1969", 1, session)).toThrow(new Error("expiryDateInvalid"));
    });

    test("Error if year is more than 2070", () => {
        expect(() => validDataChecker("11", "11", "2071", 1, session)).toThrow(new Error("expiryDateInvalid"));
    });

    test("Error if month is greater than 12", () => {
        expect(() => validDataChecker("11", "13", "1999", 1, session)).toThrow(new Error("expiryDateInvalid"));
    });

    test("Error if day is not valid for month", () => {
        expect(() => validDataChecker("30", "02", "1999", 1, session)).toThrow(new Error("expiryDateInvalid"));
    });

    test("Error if date given is non-numeric", () => {
        expect(() => validDataChecker("a", "01", "2024", 1, session)).toThrow(new Error("expiryDateNonNumeric"));
    });

    test("No error for valid date within acceptable range", () => {
        expect(() => validDataChecker("15", "07", "2000", 1, session)).toBeTruthy();
    });

    test("Error if day length is more than 2 digits", () => {
        expect(() => validDataChecker("123", "01", "2024", 1, session)).toThrow(new Error("expiryDateInvalid"));
    });

    test("Error if month is zero", () => {
        expect(() => validDataChecker("11", "00", "1999", 1, session)).toThrow(new Error("expiryDateInvalid"));
    });

    test("Error if day is zero", () => {
        expect(() => validDataChecker("00", "01", "1999", 1, session)).toThrow(new Error("expiryDateInvalid"));
    });

    test("Leap year test: valid leap day", () => {
        expect(() => validDataChecker("29", "02", "2020", 1, session)).toBeTruthy();
    });

    test("Leap year test: invalid leap day", () => {
        expect(() => validDataChecker("29", "02", "2019", 1, session)).toThrow(new Error("expiryDateInvalid"));
    });

    test("Error if year has non-numeric characters", () => {
        expect(() => validDataChecker("11", "01", "20a0", 1, session)).toThrow(new Error("expiryDateNonNumeric"));
    });

    test("Error if month has non-numeric characters", () => {
        expect(() => validDataChecker("11", "a1", "2020", 1, session)).toThrow(new Error("expiryDateNonNumeric"));
    });

    test("Error if day has non-numeric characters", () => {
        expect(() => validDataChecker("1a", "01", "2020", 1, session)).toThrow(new Error("expiryDateNonNumeric"));
    });

    test("Error if expiry date is before when the id docs are checked", () => {
        const clientData = { whenIdentityChecksCompleted: new Date(2024, 2, 5) };
        const session = getSessionRequestWithPermission();
        session.setExtraData(USER_DATA, clientData);
        expect(() => validDataChecker("05", "02", "2023", 1, session)).toThrow(new Error("dateAfterIdChecksDone"));
    });

    test("Error if expiry date is equal to when the id docs are checked", () => {
        const clientData = { whenIdentityChecksCompleted: new Date(2024, 2, 5) };
        const session = getSessionRequestWithPermission();
        session.setExtraData(USER_DATA, clientData);
        expect(() => validDataChecker("05", "03", "2024", 1, session)).toThrow(new Error("dateAfterIdChecksDone"));
    });

    test("Error if expiry date is after when the id docs are checked", () => {
        const clientData = { whenIdentityChecksCompleted: new Date(2024, 2, 5) };
        const session = getSessionRequestWithPermission();
        session.setExtraData(USER_DATA, clientData);
        expect(() => validDataChecker("05", "04", "2024", 1, session)).toBeTruthy();
    });
});

describe("validateAgainstWhenIdDocsChecked", () => {
    let mockSession: Session;

    beforeEach(() => {
        mockSession = {
            getExtraData: jest.fn()
        } as unknown as Session;
    });

    it("should not throw an error when expiry date is after 18 months before whenIdentityChecksCompleted for UK biometric residence permit", () => {
        const clientData: ClientData = {
            whenIdentityChecksCompleted: "2025-03-01",
            documentsChecked: ["UK_biometric_residence_permit"]
        };
        (mockSession.getExtraData as jest.Mock).mockReturnValue(clientData);

        expect(() => {
            validateAgainstWhenIdDocsChecked(15, 10, 2026, 1, mockSession);
        }).not.toThrow();
    });

    it("should throw an error when expiry date is before 18 months before whenIdentityChecksCompleted for UK biometric residence permit", () => {
        const clientData: ClientData = {
            whenIdentityChecksCompleted: "2025-03-01",
            documentsChecked: ["UK_biometric_residence_permit"]
        };
        (mockSession.getExtraData as jest.Mock).mockReturnValue(clientData);

        expect(() => {
            validateAgainstWhenIdDocsChecked(15, 8, 2023, 1, mockSession);
        }).toThrow("UK_biometric_residence_permit");
    });

    it("should not throw an error when expiry date is after whenIdentityChecksCompleted for non-UK biometric residence permit", () => {
        const clientData: ClientData = {
            whenIdentityChecksCompleted: "2025-03-01",
            documentsChecked: ["passport"]
        };
        (mockSession.getExtraData as jest.Mock).mockReturnValue(clientData);

        expect(() => {
            validateAgainstWhenIdDocsChecked(15, 4, 2025, 1, mockSession);
        }).not.toThrow();
    });

    it("should throw an error when expiry date is before whenIdentityChecksCompleted for non-UK biometric residence permit", () => {
        const clientData: ClientData = {
            whenIdentityChecksCompleted: "2025-03-01",
            documentsChecked: ["UK_frontier_worker_permit"]
        };
        (mockSession.getExtraData as jest.Mock).mockReturnValue(clientData);

        expect(() => {
            validateAgainstWhenIdDocsChecked(15, 2, 2025, 1, mockSession);
        }).toThrow("dateAfterIdChecksDone");
    });

    it("should throw an error when expiry date is equal to whenIdentityChecksCompleted for non-UK biometric residence permit", () => {
        const clientData: ClientData = {
            whenIdentityChecksCompleted: "2025-03-01",
            documentsChecked: ["UK_frontier_worker_permit"]
        };
        (mockSession.getExtraData as jest.Mock).mockReturnValue(clientData);

        expect(() => {
            validateAgainstWhenIdDocsChecked(1, 3, 2025, 1, mockSession);
        }).toThrow("dateAfterIdChecksDone");
    });
});
