import mocks from "../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../src/app";
import { CONFIRM_HOME_ADDRESS, BASE_URL, WHEN_IDENTITY_CHECKS_COMPLETED, CHECK_YOUR_ANSWERS } from "../../../src/types/pageURL";
import { sessionMiddleware } from "../../../src/middleware/session_middleware";
import { getSessionRequestWithPermission } from "../../mocks/session.mock";
import { CHECK_YOUR_ANSWERS_FLAG } from "../../../src/utils/constants";
import { Request, Response, NextFunction } from "express";
import * as localise from "../../../src/utils/localise";

jest.mock("@companieshouse/api-sdk-node");
const router = supertest(app);

let customMockSessionMiddleware: any;

describe("GET" + CONFIRM_HOME_ADDRESS, () => {
    it("should render the confirmation page with status 200 ans display the information on the screen", async () => {
        const res = await router.get(BASE_URL + CONFIRM_HOME_ADDRESS);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.status).toBe(200);
        expect(res.text).toContain("Confirm their home address");
    });

    it("should return status 500 if an error occurs", async () => {
        jest.spyOn(localise, "selectLang").mockImplementationOnce(() => {
            throw new Error("Test error");
        });
        const res = await router.get(BASE_URL + CONFIRM_HOME_ADDRESS);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});

describe("POST" + CONFIRM_HOME_ADDRESS, () => {
    it("should return status 302 after redirect", async () => {
        const res = await router.post(BASE_URL + CONFIRM_HOME_ADDRESS);
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(BASE_URL + WHEN_IDENTITY_CHECKS_COMPLETED + "?lang=en");
    });

    it("should return status 302 after redirect to Check Your Answers", async () => {
        createMockSessionMiddleware();
        const res = await router.post(BASE_URL + CONFIRM_HOME_ADDRESS);
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(BASE_URL + CHECK_YOUR_ANSWERS + "?lang=en");
    });

    it("should return status 500 if an error occurs", async () => {
        jest.spyOn(localise, "selectLang").mockImplementationOnce(() => {
            throw new Error("Test error");
        });
        const res = await router.post(BASE_URL + CONFIRM_HOME_ADDRESS);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});

function createMockSessionMiddleware () {
    customMockSessionMiddleware = sessionMiddleware as jest.Mock;
    const session = getSessionRequestWithPermission();
    session.setExtraData(CHECK_YOUR_ANSWERS_FLAG, true);
    customMockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
        req.session = session;
        next();
    });
}
