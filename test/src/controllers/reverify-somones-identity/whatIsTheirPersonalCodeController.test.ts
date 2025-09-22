import mocks from "../../../mocks/all_middleware_mock";
import app from "../../../../src/app";
import supertest from "supertest";
import { REVERIFY_BASE_URL, REVERIFY_PERSONS_EMAIL_ADDRESS, REVERIFY_PERSONAL_CODE, REVERIFY_PERSONAL_CODE_IS_INVALID, CHECK_YOUR_ANSWERS } from "../../../../src/types/pageURL";
import * as localise from "../../../../src/utils/localise";
import * as urlService from "../../../../src/services/url";
import { findIdentityByUvid } from "../../../../src/services/identityVerificationService";
import { dummyIdentity, dummyReverificationIdentity } from "../../../mocks/identity.mock";
import { CHECK_YOUR_ANSWERS_FLAG, PREVIOUS_PAGE_URL } from "../../../../src/utils/constants";
import { sessionMiddleware } from "../../../../src/middleware/session_middleware";
import { getSessionRequestWithPermission } from "../../../mocks/session.mock";
import { Request, NextFunction } from "express";

jest.mock("../../../../src/services/identityVerificationService.ts");

const mockFindIdentityByUvid = findIdentityByUvid as jest.Mock;

const router = supertest(app);

let customMockSessionMiddleware: any;

describe("What is their personal code GET", () => {

    it("Should return the status 200", async () => {
        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_PERSONAL_CODE);
        expect(res.status).toBe(200);
        expect(res.text).toContain("What is their personal code?");
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
    });

    it("Back button test", async () => {
        jest.spyOn(urlService, "getPreviousPageUrl").mockReturnValue(REVERIFY_BASE_URL);
        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_PERSONAL_CODE);
        expect(res.text).toContain(REVERIFY_BASE_URL + "?lang=en");
    });

    it("Should handle the error", async () => {
        const errorMessage = "Test error";
        jest.spyOn(localise, "getLocalesService").mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_PERSONAL_CODE);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });

    it("it should use check your answer as PreviousPage when getPreviousPageUrl matches ", async () => {
        const addLangToUrl = localise.addLangToUrl;
        const lang = "en";

        const expectedPreviousPage = addLangToUrl(REVERIFY_BASE_URL + CHECK_YOUR_ANSWERS, lang);
        jest.spyOn(urlService, "getPreviousPageUrl").mockReturnValueOnce(expectedPreviousPage);
        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_PERSONAL_CODE);
        expect(res.status).toBe(200);
        expect(res.text).toContain(expectedPreviousPage);
    });

});

describe("What is their personal code POST", () => {

    it("should return status 302 after redirect", async () => {
        await mockFindIdentityByUvid.mockResolvedValueOnce(dummyReverificationIdentity);
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_PERSONAL_CODE).send({ personalCode: "A1B2H3D4E5F" });
        expect(res.status).toBe(302);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.header.location).toBe(REVERIFY_BASE_URL + REVERIFY_PERSONS_EMAIL_ADDRESS + "?lang=en");
    });

    it("should show the error page if an error occurs", async () => {
        const errorMessage = "Test error";
        await mockFindIdentityByUvid.mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_PERSONAL_CODE).send({ personalCode: "A1B2H3D4E5F" });
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });

    it("Should show a validation error when the personal code is empty", async () => {
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_PERSONAL_CODE).send({ personalCode: "" });
        expect(res.text).toContain("Enter their personal code");
        expect(res.status).toBe(400);
    });

    it("Validation test for the invalid format", async () => {
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_PERSONAL_CODE).send({ personalCode: "A1B-2H3D-4E5F-" });
        expect(res.text).toContain("Enter a valid personal code");
    });

    it("Should display the error page if an error occurs", async () => {
        const errorMessage = "Test error";
        jest.spyOn(localise, "getLocalesService").mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_PERSONAL_CODE);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });

    it("should return status 302 and redirect to kickout screen if identity has invalid status", async () => {
        await mockFindIdentityByUvid.mockResolvedValueOnce(dummyIdentity);
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_PERSONAL_CODE).send({ personalCode: "A1B2H3D4E5F" });
        expect(res.status).toBe(302);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.header.location).toBe(REVERIFY_BASE_URL + REVERIFY_PERSONAL_CODE_IS_INVALID + "?lang=en");
    });

    it("should return status 302 and redirect to kickout screen if identity is undefined", async () => {
        await mockFindIdentityByUvid.mockResolvedValueOnce(undefined);
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_PERSONAL_CODE).send({ personalCode: "A1B2H3D4E5F" });
        expect(res.status).toBe(302);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.header.location).toBe(REVERIFY_BASE_URL + REVERIFY_PERSONAL_CODE_IS_INVALID + "?lang=en");
    });

    it("should redirect to check your answer if CHECK_YOUR_ANSWER_FLAG is set", async () => {
        createMockSessionCheckYourAnswersFlagMiddleware();
        await mockFindIdentityByUvid.mockResolvedValueOnce(dummyReverificationIdentity);

        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_PERSONAL_CODE)
            .send({ personalCode: "A1B2H3D4E5F" });

        expect(res.status).toBe(302);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.header.location).toBe(REVERIFY_BASE_URL + CHECK_YOUR_ANSWERS + "?lang=en");
    });

    it("it should use check your answer as PreviousPage when getPreviousPageUrl matches ", async () => {
        const addLangToUrl = localise.addLangToUrl;
        const lang = "en";

        const expectedPreviousPage = addLangToUrl(REVERIFY_BASE_URL + CHECK_YOUR_ANSWERS, lang);
        jest.spyOn(urlService, "getPreviousPageUrl").mockReturnValueOnce(expectedPreviousPage);
        await mockFindIdentityByUvid.mockResolvedValueOnce(dummyReverificationIdentity);

        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_PERSONAL_CODE).send({ personalCode: "A1B2H3D4E5F" });
        expect(res.status).toBe(200);
        expect(res.text).toContain(expectedPreviousPage);
    });

});

function createMockSessionCheckYourAnswersFlagMiddleware () {
    customMockSessionMiddleware = sessionMiddleware as jest.Mock;
    const session = getSessionRequestWithPermission();
    session.setExtraData(PREVIOUS_PAGE_URL, "/tell-companies-house-you-have-verified-someones-identity/check-your-answers?lang=en");
    session.setExtraData(CHECK_YOUR_ANSWERS_FLAG, true);
    customMockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
        req.session = session;
        next();
    });
}
