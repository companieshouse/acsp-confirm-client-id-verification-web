import mocks from "../../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../../src/app";
import { REVERIFY_BASE_URL, REVERIFY_CHECK_YOUR_ANSWERS, REVERIFY_DATE_OF_BIRTH, REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS, REVERIFY_PERSONS_NAME_ON_PUBLIC_REGISTER } from "../../../../src/types/pageURL";
import { sessionMiddleware } from "../../../../src/middleware/session_middleware";
import { getSessionRequestWithPermission } from "../../../mocks/session.mock";
import { PREVIOUS_PAGE_URL, USER_DATA } from "../../../../src/utils/constants";
import { Request, Response, NextFunction } from "express";
import * as localise from "../../../../src/utils/localise";

const router = supertest(app);

let customMockSessionMiddleware: any;

beforeEach(() => {
    jest.clearAllMocks();
});

describe("GET" + REVERIFY_DATE_OF_BIRTH, () => {
    it("should return status 200", async () => {
        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_DATE_OF_BIRTH);
        expect(res.status).toBe(200);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.text).toContain("What is their date of birth?");
    });

    it("should show the error page if an error occurs", async () => {
        const errorMessage = "Test error";
        jest.spyOn(localise, "getLocalesService").mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_DATE_OF_BIRTH);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });

    it("should return status 200 when accessing page directly from check your answers URL", async () => {
        const res = await router
            .get(REVERIFY_BASE_URL + REVERIFY_DATE_OF_BIRTH)
            .set("Referer", REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS + "?lang=en");
        expect(res.status).toBe(200);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    });

    it("should return status 200 when accessing page from persons name on public register URL", async () => {
        const res = await router
            .get(REVERIFY_BASE_URL + REVERIFY_DATE_OF_BIRTH)
            .set("Referer", REVERIFY_BASE_URL + REVERIFY_PERSONS_NAME_ON_PUBLIC_REGISTER + "?lang=en");
        expect(res.status).toBe(200);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    });
});

describe("POST" + REVERIFY_DATE_OF_BIRTH, () => {
    // Test for correct form details entered, will return 302 after redirecting to the next page.
    it("should return status 302 after redirect", async () => {
        const sendData = {
            "dob-day": "11",
            "dob-month": "2",
            "dob-year": "1999"
        };
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_DATE_OF_BIRTH).send(sendData);
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(REVERIFY_BASE_URL + REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS + "?lang=en");
    });

    it("should return status 302 after redirect to Check Your Answers", async () => {
        createMockSessionMiddleware();
        const sendData = {
            "dob-day": "11",
            "dob-month": "2",
            "dob-year": "1999"
        };
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_DATE_OF_BIRTH).send(sendData);
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS + "?lang=en");
    });

    // Test for incorrect form details entered, will return 400.
    it("should return status 400", async () => {
        const sendData = {
            "dob-day": "",
            "dob-month": "",
            "dob-year": ""
        };
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_DATE_OF_BIRTH).send(sendData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("Enter their date of birth");
    });

    it("should show the error page if an error occurs", async () => {
        const errorMessage = "Test error";
        jest.spyOn(localise, "getLocalesService").mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_DATE_OF_BIRTH);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });

    it("should show technical difficulties screen if session is undefined", async () => {
        const undefinedSessionMockMiddleware = sessionMiddleware as jest.Mock;
        undefinedSessionMockMiddleware.mockImplementationOnce((req: Request, res: Response, next: NextFunction) => {
            req.session = undefined;
            next();
        });

        const sendData = {
            "dob-day": "11",
            "dob-month": "2",
            "dob-year": "1999"
        };

        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_DATE_OF_BIRTH).send(sendData);

        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});

function createMockSessionMiddleware () {
    customMockSessionMiddleware = sessionMiddleware as jest.Mock;
    const session = getSessionRequestWithPermission();
    session.setExtraData(USER_DATA, {
        firstName: "John",
        middleName: "",
        lastName: "Doe"
    });
    session.setExtraData(PREVIOUS_PAGE_URL, REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS + "?lang=en");
    customMockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
        req.session = session;
        next();
    });
}
