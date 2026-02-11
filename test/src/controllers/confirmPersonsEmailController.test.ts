import mocks from "../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../src/app";
import { BASE_URL, CONFIRM_EMAIL_ADDRESS, CHECK_YOUR_ANSWERS, DATE_OF_BIRTH } from "../../../src/types/pageURL";
import { sessionMiddleware } from "../../../src/middleware/session_middleware";
import { getSessionRequestWithPermission } from "../../mocks/session.mock";
import { CHECK_YOUR_ANSWERS_FLAG, USER_DATA } from "../../../src/utils/constants";
import { Request, Response, NextFunction } from "express";
import * as localise from "../../../src/utils/localise";

const router = supertest(app);
let customMockSessionMiddleware: any;

describe("GET" + CONFIRM_EMAIL_ADDRESS, () => {
    it("should return status 200", async () => {
        const res = await router.get(BASE_URL + CONFIRM_EMAIL_ADDRESS);
        expect(res.status).toBe(200);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    });

    it("should return status 200 when session has no USER_DATA", async () => {
        // Override the session middleware to provide a session without USER_DATA
        customMockSessionMiddleware = sessionMiddleware as jest.Mock;
        const session = getSessionRequestWithPermission();
        session.setExtraData(USER_DATA, undefined);
        customMockSessionMiddleware.mockImplementationOnce((req: Request, res: Response, next: NextFunction) => {
            req.session = session;
            next();
        });

        const res = await router.get(BASE_URL + CONFIRM_EMAIL_ADDRESS);
        expect(res.status).toBe(200);
    });

    it("should show the error page if an error occurs", async () => {
        const errorMessage = "Test error";
        jest.spyOn(localise, "getLocalesService").mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.get(BASE_URL + CONFIRM_EMAIL_ADDRESS);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});

describe("POST" + CONFIRM_EMAIL_ADDRESS, () => {
    // Test for confirmation checkbox ticked, will return 302 after redirecting to the next page.
    it("should return status 302 after redirect", async () => {
        const res = await router.post(BASE_URL + CONFIRM_EMAIL_ADDRESS)
            .send({
                "confirm-email-address": "true"
            });
        expect(res.status).toBe(302);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.header.location).toBe(BASE_URL + DATE_OF_BIRTH + "?lang=en");
    });

    // Test for confirmation checkbox unticked, will return 400.
    it("should return status 400 if email is undefined", async () => {
        const sendData = {
            "confirm-email-address": undefined
        };
        const res = await router.post(BASE_URL + CONFIRM_EMAIL_ADDRESS).send(sendData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("Select to confirm the email address");
    });

    it("should return status 400 if the payload is undefined", async () => {
        const sendData = undefined;
        const res = await router.post(BASE_URL + CONFIRM_EMAIL_ADDRESS).send(sendData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("Select to confirm the email address");
    });

    it("should return status 302 after redirect to Check Your Answers", async () => {
        createMockSessionMiddleware();
        const res = await router.post(BASE_URL + CONFIRM_EMAIL_ADDRESS)
            .send({
                "confirm-email-address": "true"
            });
        expect(res.status).toBe(302);
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.header.location).toBe(BASE_URL + CHECK_YOUR_ANSWERS + "?lang=en");
    });

    it("should show the error page if an error occurs", async () => {
        const errorMessage = "Test error";
        jest.spyOn(localise, "getLocalesService").mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.post(BASE_URL + CONFIRM_EMAIL_ADDRESS);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});

function createMockSessionMiddleware () {
    customMockSessionMiddleware = sessionMiddleware as jest.Mock;
    const session = getSessionRequestWithPermission();
    session.setExtraData(CHECK_YOUR_ANSWERS_FLAG, true);
    session.setExtraData(USER_DATA, {
        firstName: "John",
        middleName: "",
        lastName: "Doe"
    }
    );
    customMockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
        req.session = session;
        next();
    });
}
