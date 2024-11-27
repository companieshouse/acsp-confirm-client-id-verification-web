import mocks from "../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../src/app";
import { BASE_URL, CHECK_YOUR_ANSWERS, CONFIRM_IDENTITY_VERIFICATION, ID_DOCUMENT_DETAILS } from "../../../src/types/pageURL";
import { sessionMiddleware } from "../../../src/middleware/session_middleware";
import { getSessionRequestWithPermission } from "../../mocks/session.mock";
import { CHECK_YOUR_ANSWERS_FLAG, USER_DATA } from "../../../src/utils/constants";
import { Request, Response, NextFunction } from "express";

jest.mock("@companieshouse/api-sdk-node");

const router = supertest(app);

let customMockSessionMiddleware: any;

describe("GET" + ID_DOCUMENT_DETAILS, () => {
    it("should return status 200", async () => {
        const res = await router.get(BASE_URL + ID_DOCUMENT_DETAILS);
        expect(res.status).toBe(200);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.text).toContain("Enter the details exactly as they appear on the document");
    });
});

describe("POST " + ID_DOCUMENT_DETAILS, () => {
    it("should redirect to confirmation page on valid input", async () => {
        const FormData = {
            documentNumber_1: "ABC12345X",
            expiryDateDay_1: "01",
            expiryDateMonth_1: "12",
            expiryDateYear_1: "2030",
            countryInput_1: "United Kingdom"
        };
        const res = await router.post(BASE_URL + ID_DOCUMENT_DETAILS).send(FormData);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(BASE_URL + CONFIRM_IDENTITY_VERIFICATION + "?lang=en");
    });

    it("should status 400 for invalid input", async () => {
        const FormData = {
            documentNumber_1: "",
            expiryDateDay_1: "",
            expiryDateMonth_1: "",
            expiryDateYear_1: "",
            countryInput_1: ""
        };
        const res = await router.post(BASE_URL + ID_DOCUMENT_DETAILS).send(FormData);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.status).toBe(400);
    });

    it("should redirect to confirmation page on valid input", async () => {
        createMockSessionMiddleware();
        const FormData = {
            documentNumber_1: "ABC12345X",
            expiryDateDay_1: "01",
            expiryDateMonth_1: "12",
            expiryDateYear_1: "2030",
            countryInput_1: "United Kingdom"
        };
        const res = await router.post(BASE_URL + ID_DOCUMENT_DETAILS).send(FormData);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(BASE_URL + CHECK_YOUR_ANSWERS + "?lang=en");
    });
});

function createMockSessionMiddleware () {
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
