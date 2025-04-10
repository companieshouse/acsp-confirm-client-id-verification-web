import mocks from "../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../src/app";
import { BASE_URL, WHEN_IDENTITY_CHECKS_COMPLETED, HOW_IDENTITY_DOCUMENTS_CHECKED, CHECK_YOUR_ANSWERS } from "../../../src/types/pageURL";
import { sessionMiddleware } from "../../../src/middleware/session_middleware";
import { getSessionRequestWithPermission } from "../../mocks/session.mock";
import { PREVIOUS_PAGE_URL, USER_DATA } from "../../../src/utils/constants";
import { Request, Response, NextFunction } from "express";
import * as localise from "../../../src/utils/localise";

const router = supertest(app);

let customMockSessionMiddleware: any;

describe("GET" + WHEN_IDENTITY_CHECKS_COMPLETED, () => {
    it("should return status 200", async () => {
        const res = await router.get(BASE_URL + WHEN_IDENTITY_CHECKS_COMPLETED);
        expect(res.status).toBe(200);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.text).toContain("When were the identity checks completed?");
    });

    it("should show the error page if an error occurs", async () => {
        const errorMessage = "Test error";
        jest.spyOn(localise, "getLocalesService").mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.get(BASE_URL + WHEN_IDENTITY_CHECKS_COMPLETED);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});

describe("POST" + WHEN_IDENTITY_CHECKS_COMPLETED, () => {
    // Test for correct form details entered, will return 302 after redirecting to the next page.
    it("should return status 302 after redirect", async () => {
        const sendData = {
            "wicc-day": "08",
            "wicc-month": "07",
            "wicc-year": "2024"
        };
        const res = await router.post(BASE_URL + WHEN_IDENTITY_CHECKS_COMPLETED).send(sendData);
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(BASE_URL + HOW_IDENTITY_DOCUMENTS_CHECKED + "?lang=en");
    });

    it("should return status 302 after redirect to Check Your Answers", async () => {
        createMockSessionMiddleware();
        const sendData = {
            "wicc-day": "08",
            "wicc-month": "07",
            "wicc-year": "2024"
        };
        const res = await router.post(BASE_URL + WHEN_IDENTITY_CHECKS_COMPLETED).send(sendData);
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(BASE_URL + CHECK_YOUR_ANSWERS + "?lang=en");
    });

    // Test for incorrect form details entered, will return 400.
    it("should return status 400", async () => {
        const sendData = {
            "wicc-day": "",
            "wicc-month": undefined,
            "wicc-year": ""
        };
        const res = await router.post(BASE_URL + WHEN_IDENTITY_CHECKS_COMPLETED).send(sendData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("When were the identity checks completed?");
    });

    it("should show the error page if an error occurs", async () => {
        const errorMessage = "Test error";
        jest.spyOn(localise, "getLocalesService").mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.get(BASE_URL + WHEN_IDENTITY_CHECKS_COMPLETED);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});

function createMockSessionMiddleware () {
    customMockSessionMiddleware = sessionMiddleware as jest.Mock;
    const session = getSessionRequestWithPermission();
    session.setExtraData(PREVIOUS_PAGE_URL, "/tell-companies-house-you-have-verified-someones-identity/check-your-answers?lang=en");
    const clientData = {
        firstName: "John",
        middleName: "",
        lastName: "Doe",
        dateOfBirth: new Date(2000, 2, 5)
    };
    session.setExtraData(USER_DATA, clientData);
    customMockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
        req.session = session;
        next();
    });
}
