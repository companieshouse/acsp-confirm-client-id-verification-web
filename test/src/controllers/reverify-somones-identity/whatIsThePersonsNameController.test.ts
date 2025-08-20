import mocks from "../../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../../src/app";
import { REVERIFY_BASE_URL, REVERIFY_CHECK_YOUR_ANSWERS, REVERIFY_PERSONS_NAME, REVERIFY_SHOW_ON_PUBLIC_REGISTER } from "../../../../src/types/pageURL";
import { PREVIOUS_PAGE_URL, USER_DATA } from "../../../../src/utils/constants";
import { sessionMiddleware } from "../../../../src/middleware/session_middleware";
import { getSessionRequestWithPermission } from "../../../mocks/session.mock";
import { Request, Response, NextFunction } from "express";
import { session } from "../../../mocks/session_middleware_mock";
import * as localise from "../../../../src/utils/localise";

const router = supertest(app);

let customMockSessionMiddleware: any;

describe("GET" + REVERIFY_PERSONS_NAME, () => {
    it("should return status 200", async () => {
        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_PERSONS_NAME);
        expect(res.status).toBe(200);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    });

    it("should show the error page if an error occurs", async () => {
        const errorMessage = "Test error";
        jest.spyOn(localise, "getLocalesService").mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_PERSONS_NAME);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });

    it("should return status 200 when accessing page from check your answers", async () => {
        createMockSessionMiddleware();
        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_PERSONS_NAME);
        expect(res.status).toBe(200);
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    });

    it("should return status 200 when no user data exists in session", async () => {
        customMockSessionMiddleware = sessionMiddleware as jest.Mock;
        const session = getSessionRequestWithPermission();

        session.setExtraData(USER_DATA, undefined);
        customMockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            req.session = session;
            next();
        });

        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_PERSONS_NAME);
        expect(res.status).toBe(200);
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    });
});

describe("POST" + REVERIFY_PERSONS_NAME, () => {
    it("should return status 302 after redirect to /what-we-show-on-the-public-register", async () => {
        session.setExtraData(PREVIOUS_PAGE_URL, "/reverify-someones-identity-for-companies-house?lang=en");
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_PERSONS_NAME)
            .send({
                "first-name": "John",
                "middle-names": "",
                "last-name": "Doe"
            });
        expect(res.status).toBe(302);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.header.location).toBe(REVERIFY_BASE_URL + REVERIFY_SHOW_ON_PUBLIC_REGISTER + "?lang=en");
    });

    it("should return status 302 after redirect to Check Your Answers", async () => {
        createMockSessionMiddleware();
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_PERSONS_NAME)
            .send({
                "first-name": "John",
                "middle-names": "",
                "last-name": "Doe"
            });
        expect(res.status).toBe(302);
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.header.location).toBe(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS + "?lang=en");
    });

    it("should return status 302 after redirect to Check Your Answers when first name has special characters", async () => {
        const sendData = {
            "first-name": "John%",
            "middle-names": "",
            "last-name": "Doe"
        };
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_PERSONS_NAME).send(sendData);
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS + "?lang=en");
    });

    it("should return status 302 after redirect to Check Your Answers when middle name has special characters", async () => {
        const sendData = {
            "first-name": "John",
            "middle-names": "%",
            "last-name": "Doe"
        };
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_PERSONS_NAME).send(sendData);
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS + "?lang=en");
    });

    it("should return status 302 after redirect to Check Your Answers when last name has special characters", async () => {
        const sendData = {
            "first-name": "John",
            "middle-names": "",
            "last-name": "Doe&"
        };
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_PERSONS_NAME).send(sendData);
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS + "?lang=en");
    });

    it("should return status 400 after no first name entered", async () => {
        const sendData = {
            "first-name": "",
            "middle-names": "middlename",
            "last-name": "lname"
        };
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_PERSONS_NAME).send(sendData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("Enter their first name");
    });

    it("should return status 400 after no last name entered", async () => {
        const sendData = {
            "first-name": "fname",
            "middle-names": "",
            "last-name": ""
        };
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_PERSONS_NAME).send(sendData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("Enter their last name");
    });

    it("should return status 400 after no first and last name entered", async () => {
        const sendData = {
            "first-name": "",
            "middle-names": "",
            "last-name": ""
        };
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_PERSONS_NAME).send(sendData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("Enter their first name");
        expect(res.text).toContain("Enter their last name");
    });

    it("should return status 400 after first name more than 50 characters", async () => {
        const sendData = {
            "first-name": "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz",
            "middle-names": "",
            "last-name": "Doe"
        };
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_PERSONS_NAME).send(sendData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("First name must be 50 characters or less");
    });

    it("should return status 400 after middle name more than 50 characters", async () => {
        const sendData = {
            "first-name": "John",
            "middle-names": "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz",
            "last-name": "Doe"
        };
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_PERSONS_NAME).send(sendData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("Middle names must be 50 characters or less");
    });

    it("should return status 400 after last name more than 160 characters", async () => {
        const sendData = {
            "first-name": "John",
            "middle-names": "",
            "last-name": "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcde"
        };
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_PERSONS_NAME).send(sendData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("Last name must be 160 characters or less");
    });

    it("should return status 400 after last name contains incorrect characters entered", async () => {
        const sendData = {
            "first-name": "John",
            "middle-names": "",
            "last-name": "Doe|"
        };
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_PERSONS_NAME).send(sendData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("Last name must only include letters a to z, and common special characters");
    });

    it("should show the error page if an error occurs", async () => {
        const errorMessage = "Test error";
        jest.spyOn(localise, "getLocalesService").mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_PERSONS_NAME);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});

function createMockSessionMiddleware () {
    customMockSessionMiddleware = sessionMiddleware as jest.Mock;
    const session = getSessionRequestWithPermission();
    session.setExtraData(PREVIOUS_PAGE_URL, "/reverify-someones-identity-for-companies-house/check-your-answers?lang=en");
    customMockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
        req.session = session;
        next();
    });
}
