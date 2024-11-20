import mocks from "../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../src/app";
import { BASE_URL, CHECK_YOUR_ANSWERS, ID_DOCUMENT_DETAILS, WHICH_IDENTITY_DOCS_CHECKED_GROUP1 } from "../../../src/types/pageURL";
import { sessionMiddleware } from "../../../src/middleware/session_middleware";
import { getSessionRequestWithPermission } from "../../mocks/session.mock";
import { CHECK_YOUR_ANSWERS_FLAG, USER_DATA } from "../../../src/utils/constants";
import { Request, Response, NextFunction } from "express";
jest.mock("@companieshouse/api-sdk-node");

const router = supertest(app);

let customMockSessionMiddleware: any;

describe("GET" + WHICH_IDENTITY_DOCS_CHECKED_GROUP1, () => {
    it("should return status 200", async () => {
        const res = await router.get(BASE_URL + WHICH_IDENTITY_DOCS_CHECKED_GROUP1);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.status).toBe(200);
        expect(res.text).toContain("Which documents did you check to verify their identity?");
        expect(res.text).toContain("John");
        expect(res.text).toContain("Doe");
    });
});

describe("POST" + WHICH_IDENTITY_DOCS_CHECKED_GROUP1, () => {
    it("should return status 302 after redirecting to the next page", async () => {
        const inputData = {
            documentsGroup1: ["biometricPassport", "ukDriversLicence"]
        };
        const res = await router.post(BASE_URL + WHICH_IDENTITY_DOCS_CHECKED_GROUP1).send(inputData);
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(BASE_URL + ID_DOCUMENT_DETAILS + "?lang=en");
    });

    it("should return status 302 after redirecting to Check Your Answers", async () => {
        createMockSessionMiddleware();
        const inputData = {
            documentsGroup1: ["biometricPassport", "ukDriversLicence"]
        };
        const res = await router.post(BASE_URL + WHICH_IDENTITY_DOCS_CHECKED_GROUP1).send(inputData);
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(BASE_URL + CHECK_YOUR_ANSWERS + "?lang=en");
    });

    it("should return status 400 when no documents are selected", async () => {
        const inputData = {};
        const res = await router.post(BASE_URL + WHICH_IDENTITY_DOCS_CHECKED_GROUP1).send(inputData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("Select which documents you checked to verify their identity");
    });
});

function createMockSessionMiddleware () {
    customMockSessionMiddleware = sessionMiddleware as jest.Mock;
    const session = getSessionRequestWithPermission();
    session.setExtraData(CHECK_YOUR_ANSWERS_FLAG, true);
    session.setExtraData(USER_DATA, {
        howIdentityDocsChecked: "cryptographic_security_features_checked"
    });
    customMockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
        req.session = session;
        next();
    });
}
