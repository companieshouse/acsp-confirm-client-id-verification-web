import mocks from "../../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../../src/app";
import { REVERIFY_HOW_IDENTITY_DOCUMENTS_CHECKED, REVERIFY_BASE_URL, REVERIFY_WHICH_IDENTITY_DOCS_CHECKED_GROUP2, REVERIFY_WHICH_IDENTITY_DOCS_CHECKED_GROUP1, REVERIFY_CHECK_YOUR_ANSWERS } from "../../../../src/types/pageURL";
import * as localise from "../../../../src/utils/localise";
import { CRYPTOGRAPHIC_SECURITY_FEATURES, PHYSICAL_SECURITY_FEATURES, USER_DATA, PREVIOUS_PAGE_URL } from "../../../../src/utils/constants";
import { sessionMiddleware } from "../../../../src/middleware/session_middleware";
import { getSessionRequestWithPermission } from "../../../mocks/session.mock";
import { Request, Response, NextFunction } from "express";

jest.mock("@companieshouse/api-sdk-node");
const router = supertest(app);

let customMockSessionMiddleware: any;

beforeEach(() => {
    jest.clearAllMocks();
});

describe("GET" + REVERIFY_HOW_IDENTITY_DOCUMENTS_CHECKED, () => {

    it("should return status 200", async () => {
        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_HOW_IDENTITY_DOCUMENTS_CHECKED);
        expect(res.status).toBe(200);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    });

    it("should show the error page if an error occurs", async () => {
        const errorMessage = "Test error";
        jest.spyOn(localise, "getLocalesService").mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_HOW_IDENTITY_DOCUMENTS_CHECKED);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });

    it("should return status 200 when user data with firstName and lastName exists in session", async () => {
        customMockSessionMiddleware = sessionMiddleware as jest.Mock;
        const session = getSessionRequestWithPermission();

        session.setExtraData(USER_DATA, {
            firstName: "Test",
            lastName: "User"
        });

        customMockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            req.session = session;
            next();
        });

        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_HOW_IDENTITY_DOCUMENTS_CHECKED + "?lang=en");
        expect(res.status).toBe(200);
        expect(res.text).toContain("Test");
        expect(res.text).toContain("User");
    });

    it("should return status 200 when accessing from check your answers URL with previous page URL set", async () => {
        customMockSessionMiddleware = sessionMiddleware as jest.Mock;
        const session = getSessionRequestWithPermission();

        session.setExtraData(PREVIOUS_PAGE_URL, REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS + "?lang=en");
        session.setExtraData(USER_DATA, {
            firstName: "Test",
            lastName: "User"
        });

        customMockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            req.session = session;
            next();
        });

        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_HOW_IDENTITY_DOCUMENTS_CHECKED);
        expect(res.status).toBe(200);
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    });
});

describe("POST" + REVERIFY_HOW_IDENTITY_DOCUMENTS_CHECKED, () => {
    it("should return status 302 and redirect to GROUP1 when CRYPTOGRAPHIC_SECURITY_FEATURES is selected", async () => {
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_HOW_IDENTITY_DOCUMENTS_CHECKED).send({ howIdentityDocsCheckedRadio: CRYPTOGRAPHIC_SECURITY_FEATURES });
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(REVERIFY_BASE_URL + REVERIFY_WHICH_IDENTITY_DOCS_CHECKED_GROUP1 + "?lang=en");
    });

    it("should return status 302 and redirect to GROUP2 when PHYSICAL_SECURITY_FEATURES is selected", async () => {
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_HOW_IDENTITY_DOCUMENTS_CHECKED).send({ howIdentityDocsCheckedRadio: PHYSICAL_SECURITY_FEATURES });
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(REVERIFY_BASE_URL + REVERIFY_WHICH_IDENTITY_DOCS_CHECKED_GROUP2 + "?lang=en");
    });

    it("should return status 400 when validation fails and previousPageUrl is check your answers", async () => {
        customMockSessionMiddleware = sessionMiddleware as jest.Mock;
        const session = getSessionRequestWithPermission();

        session.setExtraData(USER_DATA, {
            firstName: "Test",
            lastName: "User"
        });
        session.setExtraData(PREVIOUS_PAGE_URL, REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS + "?lang=en");

        customMockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            req.session = session;
            next();
        });

        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_HOW_IDENTITY_DOCUMENTS_CHECKED).send({ howIdentityDocsCheckedRadio: "" });
        expect(res.status).toBe(400);
        expect(res.text).toContain("Select if the identity documents were checked using technology or by a person");
    });

    it("should redirect and clear documentsChecked when stored option differs from selected option", async () => {
        customMockSessionMiddleware = sessionMiddleware as jest.Mock;
        const session = getSessionRequestWithPermission();

        session.setExtraData(USER_DATA, {
            howIdentityDocsChecked: PHYSICAL_SECURITY_FEATURES,
            documentsChecked: ["biometric-passport"]
        });

        customMockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            req.session = session;
            next();
        });

        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_HOW_IDENTITY_DOCUMENTS_CHECKED).send({
            howIdentityDocsCheckedRadio: CRYPTOGRAPHIC_SECURITY_FEATURES
        });
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(REVERIFY_BASE_URL + REVERIFY_WHICH_IDENTITY_DOCS_CHECKED_GROUP1 + "?lang=en");
    });

    it("should redirect without clearing documentsChecked when stored option matches selected option", async () => {
        customMockSessionMiddleware = sessionMiddleware as jest.Mock;
        const session = getSessionRequestWithPermission();

        session.setExtraData(USER_DATA, {
            howIdentityDocsChecked: CRYPTOGRAPHIC_SECURITY_FEATURES,
            documentsChecked: ["biometric-passport"]
        });

        customMockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            req.session = session;
            next();
        });

        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_HOW_IDENTITY_DOCUMENTS_CHECKED).send({
            howIdentityDocsCheckedRadio: CRYPTOGRAPHIC_SECURITY_FEATURES
        });
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(REVERIFY_BASE_URL + REVERIFY_WHICH_IDENTITY_DOCS_CHECKED_GROUP1 + "?lang=en");
    });

    it("should handle POST with null session for optional chaining coverage", async () => {
        customMockSessionMiddleware = sessionMiddleware as jest.Mock;
        customMockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            req.session = null as any;
            next();
        });

        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_HOW_IDENTITY_DOCUMENTS_CHECKED).send({ howIdentityDocsCheckedRadio: "" });
        expect(res.status).toBe(400);
        expect(res.text).toContain("Select if the identity documents were checked using technology or by a person");
    });
});
