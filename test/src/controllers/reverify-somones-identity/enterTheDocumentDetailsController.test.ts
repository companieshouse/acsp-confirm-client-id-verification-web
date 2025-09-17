import mocks from "../../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../../src/app";
import {
    REVERIFY_BASE_URL,
    REVERIFY_CHECK_YOUR_ANSWERS,
    REVERIFY_ENTER_ID_DOCUMENT_DETAILS,
    REVERIFY_CONFIRM_IDENTITY_REVERIFICATION
} from "../../../../src/types/pageURL";
import { createPayloadForReverification } from "../../../../src/controllers/reverify-someones-identity/enterTheDocumentDetailsController";
import { sessionMiddleware } from "../../../../src/middleware/session_middleware";
import { getSessionRequestWithPermission } from "../../../mocks/session.mock";
import { CHECK_YOUR_ANSWERS_FLAG, USER_DATA } from "../../../../src/utils/constants";
import { Request, Response, NextFunction } from "express";
import * as localise from "../../../../src/utils/localise";

jest.mock("@companieshouse/api-sdk-node");

const router = supertest(app);

let customMockSessionMiddleware: any;

describe("GET" + REVERIFY_ENTER_ID_DOCUMENT_DETAILS, () => {
    it("should return status 200", async () => {
        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_ENTER_ID_DOCUMENT_DETAILS);
        expect(res.status).toBe(200);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.text).toContain("Enter the details exactly as they appear on the document");
    });

    it("should show the error page if an error occurs", async () => {
        const errorMessage = "Test error";
        jest.spyOn(localise, "getLocalesService").mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_ENTER_ID_DOCUMENT_DETAILS);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});

describe("POST " + REVERIFY_ENTER_ID_DOCUMENT_DETAILS, () => {
    it("should redirect to confirmation page on valid input", async () => {
        createMockSessionMiddleware();
        const FormData = {
            documentNumber_1: "ABC12345X",
            expiryDateDay_1: "01",
            expiryDateMonth_1: "12",
            expiryDateYear_1: "2030",
            countryInput_1: "United Kingdom"
        };
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_ENTER_ID_DOCUMENT_DETAILS).send(FormData);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(REVERIFY_BASE_URL + REVERIFY_CONFIRM_IDENTITY_REVERIFICATION + "?lang=en");
    });

    it("should status 400 for invalid input", async () => {
        const FormData = {
            documentNumber_1: "",
            expiryDateDay_1: "",
            expiryDateMonth_1: "",
            expiryDateYear_1: "",
            countryInput_1: ""
        };
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_ENTER_ID_DOCUMENT_DETAILS).send(FormData);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.status).toBe(400);
    });

    it("should redirect to confirmation page on valid input", async () => {
        createMockSessionCheckYourAnswersFlagMiddleware();
        const FormData = {
            documentNumber_1: "ABC12345X",
            expiryDateDay_1: "01",
            expiryDateMonth_1: "12",
            expiryDateYear_1: "2030",
            countryInput_1: "United Kingdom"
        };
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_ENTER_ID_DOCUMENT_DETAILS).send(FormData);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS + "?lang=en");
    });

    it("should show the error page if an error occurs", async () => {
        const errorMessage = "Test error";
        jest.spyOn(localise, "getLocalesService").mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_ENTER_ID_DOCUMENT_DETAILS);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});

describe("createPayloadForReverification tests", () => {
    it("should handle UK accredited PASS card identity document with optional expiryDate correctly", () => {
        const idDocumentDetails = [
            {
                docName: "UK_PASS_card",
                documentNumber: "12345678",
                expiryDate: undefined,
                countryOfIssue: "United Kingdom"
            }
        ];
        const formatDocumentsCheckedText = ["UK accredited PASS card"];
        const i18n = { UK_PASS_card: "UK accredited PASS card" };

        const result = createPayloadForReverification(idDocumentDetails, formatDocumentsCheckedText, i18n);

        expect(result).toEqual({
            documentNumber_1: "12345678",
            expiryDateDay_1: undefined,
            expiryDateMonth_1: undefined,
            expiryDateYear_1: undefined,
            countryInput_1: "United Kingdom"
        });
    });

    it("should handle UK HM Armed Forces Veteran Card identity document with optional expiryDate correctly", () => {
        const idDocumentDetails = [
            {
                docName: "UK_HM_veteran_card",
                documentNumber: "12345678",
                expiryDate: undefined,
                countryOfIssue: "United Kingdom"
            }
        ];
        const formatDocumentsCheckedText = ["UK HM Armed Forces Veteran Card"];
        const i18n = { UK_HM_veteran_card: "UK HM Armed Forces Veteran Card" };

        const result = createPayloadForReverification(idDocumentDetails, formatDocumentsCheckedText, i18n);

        expect(result).toEqual({
            documentNumber_1: "12345678",
            expiryDateDay_1: undefined,
            expiryDateMonth_1: undefined,
            expiryDateYear_1: undefined,
            countryInput_1: "United Kingdom"
        });
    });

    it("should construct payload correctly when expiryDate is provided", () => {
        const idDocumentDetails = [
            {
                docName: "irish_passport_card",
                documentNumber: "12345678",
                expiryDate: new Date(2030, 9, 10),
                countryOfIssue: "Ireland"
            }
        ];
        const formatDocumentsCheckedText = ["Irish passport card"];
        const i18n = { irish_passport_card: "Irish passport card" };

        const result = createPayloadForReverification(idDocumentDetails, formatDocumentsCheckedText, i18n);

        expect(result).toEqual({
            documentNumber_1: "12345678",
            expiryDateDay_1: 10,
            expiryDateMonth_1: 10,
            expiryDateYear_1: 2030,
            countryInput_1: "Ireland"
        });
    });
});

function createMockSessionCheckYourAnswersFlagMiddleware () {
    customMockSessionMiddleware = sessionMiddleware as jest.Mock;
    const session = getSessionRequestWithPermission();
    session.setExtraData(CHECK_YOUR_ANSWERS_FLAG, true);
    session.setExtraData(USER_DATA, {
        documentsChecked: ["passport"]
    });
    customMockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
        req.session = session;
        next();
    });
}

function createMockSessionMiddleware () {
    customMockSessionMiddleware = sessionMiddleware as jest.Mock;
    const session = getSessionRequestWithPermission();
    session.setExtraData(USER_DATA, {
        documentsChecked: ["passport"]
    });
    customMockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
        req.session = session;
        next();
    });
}
