import mocks from "../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../src/app";
import { BASE_URL, PERSONS_NAME, CHECK_YOUR_ANSWERS, USE_NAME_ON_PUBLIC_REGISTER } from "../../../src/types/pageURL";
import { PREVIOUS_PAGE_URL } from "../../../src/utils/constants";
import { sessionMiddleware } from "../../../src/middleware/session_middleware";
import { getSessionRequestWithPermission } from "../../mocks/session.mock";
import { Request, Response, NextFunction } from "express";
import { session } from "../../mocks/session_middleware_mock";
import * as localise from "../../../src/utils/localise";

const router = supertest(app);

let customMockSessionMiddleware: any;

describe("GET" + PERSONS_NAME, () => {
    it("should return status 200", async () => {
        const res = await router.get(BASE_URL + PERSONS_NAME);
        expect(res.status).toBe(200);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    });

    it("should show the error page if an error occurs", async () => {
        const errorMessage = "Test error";
        jest.spyOn(localise, "selectLang").mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.get(BASE_URL + PERSONS_NAME);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});

describe("POST" + PERSONS_NAME, () => {
    // Test for correct form details entered, will return 302 after redirecting to the next page.
    it("should return status 302 after redirect", async () => {
        session.setExtraData(PREVIOUS_PAGE_URL, "/tell-companies-house-you-have-verified-someones-identity?lang=en");
        const res = await router.post(BASE_URL + PERSONS_NAME)
            .send({
                "first-name": "John",
                "middle-names": "",
                "last-name": "Doe"
            });
        expect(res.status).toBe(302);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.header.location).toBe(BASE_URL + USE_NAME_ON_PUBLIC_REGISTER + "?lang=en");
    });

    it("should return status 302 after redirect to Check Your Answers", async () => {
        createMockSessionMiddleware();
        const res = await router.post(BASE_URL + PERSONS_NAME)
            .send({
                "first-name": "John",
                "middle-names": "",
                "last-name": "Doe"
            });
        expect(res.status).toBe(302);
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.header.location).toBe(BASE_URL + CHECK_YOUR_ANSWERS + "?lang=en");
    });

    // Test for incorrect form details entered, will return 400.
    it("should return status 400 after incorrect data entered", async () => {
        const sendData = {
            "first-name": "",
            "middle-names": "middlename",
            "last-name": "lname"
        };
        const res = await router.post(BASE_URL + PERSONS_NAME).send(sendData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("Enter their first name");
    });
    it("should return status 400 after incorrect data entered", async () => {
        const sendData = {
            "first-name": "fname",
            "middle-names": "",
            "last-name": ""
        };
        const res = await router.post(BASE_URL + PERSONS_NAME).send(sendData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("Enter their last name");
    });
    it("should return status 400 after incorrect data entered", async () => {
        const sendData = {
            "first-name": "",
            "middle-names": "",
            "last-name": ""
        };
        const res = await router.post(BASE_URL + PERSONS_NAME).send(sendData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("Enter their first name");
        expect(res.text).toContain("Enter their last name");
    });
    it("should return status 400 after incorrect data entered", async () => {
        const sendData = {
            "first-name": "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz",
            "middle-names": "",
            "last-name": "Doe"
        };
        const res = await router.post(BASE_URL + PERSONS_NAME).send(sendData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("First name must be 50 characters or less");
    });
    it("should return status 400 after incorrect data entered", async () => {
        const sendData = {
            "first-name": "John",
            "middle-names": "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz",
            "last-name": "Doe"
        };
        const res = await router.post(BASE_URL + PERSONS_NAME).send(sendData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("Middle names must be 50 characters or less");
    });
    it("should return status 400 after incorrect data entered", async () => {
        const sendData = {
            "first-name": "John",
            "middle-names": "",
            "last-name": "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcde"
        };
        const res = await router.post(BASE_URL + PERSONS_NAME).send(sendData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("Last name must be 160 characters or less");
    });
    it("should return status 400 after incorrect data entered", async () => {
        const sendData = {
            "first-name": "John%",
            "middle-names": "",
            "last-name": "Doe"
        };
        const res = await router.post(BASE_URL + PERSONS_NAME).send(sendData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("First name must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes");
    });
    it("should return status 400 after incorrect data entered", async () => {
        const sendData = {
            "first-name": "John",
            "middle-names": "%",
            "last-name": "Doe"
        };
        const res = await router.post(BASE_URL + PERSONS_NAME).send(sendData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("Middle name or names must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes");
    });
    it("should return status 400 after incorrect data entered", async () => {
        const sendData = {
            "first-name": "John",
            "middle-names": "",
            "last-name": "Doe&"
        };
        const res = await router.post(BASE_URL + PERSONS_NAME).send(sendData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("Last name must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes");
    });

    it("should show the error page if an error occurs", async () => {
        const errorMessage = "Test error";
        jest.spyOn(localise, "selectLang").mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.post(BASE_URL + PERSONS_NAME);
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
