import mocks from "../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../src/app";
import { BASE_URL, CHECK_YOUR_ANSWERS, DATE_OF_BIRTH, HOME_ADDRESS } from "../../../src/types/pageURL";
import { sessionMiddleware } from "../../../src/middleware/session_middleware";
import { getSessionRequestWithPermission } from "../../mocks/session.mock";
import { PREVIOUS_PAGE_URL } from "../../../src/utils/constants";
import { Request, NextFunction } from "express";
import * as localise from "../../../src/utils/localise";

const router = supertest(app);

let customMockSessionMiddleware: any;

describe("GET" + DATE_OF_BIRTH, () => {
    it("should return status 200", async () => {
        const res = await router.get(BASE_URL + DATE_OF_BIRTH);
        expect(res.status).toBe(200);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.text).toContain("What is their date of birth?");
    });

    it("should show the error page if an error occurs", async () => {
        const errorMessage = "Test error";
        jest.spyOn(localise, "selectLang").mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.get(BASE_URL + DATE_OF_BIRTH);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});

describe("POST" + DATE_OF_BIRTH, () => {
    // Test for correct form details entered, will return 302 after redirecting to the next page.
    it("should return status 302 after redirect", async () => {
        const sendData = {
            "dob-day": "11",
            "dob-month": "2",
            "dob-year": "1999"
        };
        const res = await router.post(BASE_URL + DATE_OF_BIRTH).send(sendData);
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(BASE_URL + HOME_ADDRESS + "?lang=en");
    });

    it("should return status 302 after redirect to Check Your Answers", async () => {
        createMockSessionMiddleware();
        const sendData = {
            "dob-day": "11",
            "dob-month": "2",
            "dob-year": "1999"
        };
        const res = await router.post(BASE_URL + DATE_OF_BIRTH).send(sendData);
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(BASE_URL + CHECK_YOUR_ANSWERS + "?lang=en");
    });

    // Test for incorrect form details entered, will return 400.
    it("should return status 400", async () => {
        const sendData = {
            "dob-day": "",
            "dob-month": undefined,
            "dob-year": ""
        };
        const res = await router.post(BASE_URL + DATE_OF_BIRTH).send(sendData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("Enter their date of birth");
    });

    it("should show the error page if an error occurs", async () => {
        const errorMessage = "Test error";
        jest.spyOn(localise, "selectLang").mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.post(BASE_URL + DATE_OF_BIRTH);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});

function createMockSessionMiddleware () {
    customMockSessionMiddleware = sessionMiddleware as jest.Mock;
    const session = getSessionRequestWithPermission();
    session.setExtraData(PREVIOUS_PAGE_URL, "/tell-companies-house-you-have-verified-someones-identity/check-your-answers?lang=en");
    customMockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
        req.session = session;
        next();
    });
}
