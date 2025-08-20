import mocks from "../../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../../src/app";
import { sessionMiddleware } from "../../../../src/middleware/session_middleware";
import { getSessionRequestWithPermission } from "../../../mocks/session.mock";
import { Request, NextFunction } from "express";
import { REVERIFY_PERSONS_NAME_ON_PUBLIC_REGISTER, REVERIFY_BASE_URL, REVERIFY_DATE_OF_BIRTH, REVERIFY_CHECK_YOUR_ANSWERS } from "../../../../src/types/pageURL";
import { PREVIOUS_PAGE_URL, USER_DATA, CHECK_YOUR_ANSWERS_FLAG } from "../../../../src/utils/constants";
import * as localise from "../../../../src/utils/localise";

const router = supertest(app);

let customMockSessionMiddleware: any;

describe("GET" + REVERIFY_PERSONS_NAME_ON_PUBLIC_REGISTER, () => {
    it("should return status 200", async () => {
        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_PERSONS_NAME_ON_PUBLIC_REGISTER);
        expect(res.status).toBe(200);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    });

    it("should show the error page if an error occurs", async () => {
        const errorMessage = "Test error";
        jest.spyOn(localise, "getLocalesService").mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_PERSONS_NAME_ON_PUBLIC_REGISTER);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});

describe("POST" + REVERIFY_PERSONS_NAME_ON_PUBLIC_REGISTER, () => {
    it("should return status 302 after redirect to the next page", async () => {
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_PERSONS_NAME_ON_PUBLIC_REGISTER)
            .send({
                "first-name": "John",
                "middle-names": "",
                "last-name": "Doe"
            });
        expect(res.status).toBe(302);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.header.location).toBe(REVERIFY_BASE_URL + REVERIFY_DATE_OF_BIRTH + "?lang=en");
    });

    it("should return status 302 after redirect to Check Your Answers", async () => {
        createMockSessionMiddleware();
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_PERSONS_NAME_ON_PUBLIC_REGISTER)
            .send({
                "first-name": "John",
                "middle-names": "",
                "last-name": "Doe"
            });
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS + "?lang=en");
    });

    it("should return status 400 after incorrect data entered", async () => {
        const sendData = {
            "first-name": "",
            "middle-names": "middlename",
            "last-name": "lname"
        };
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_PERSONS_NAME_ON_PUBLIC_REGISTER).send(sendData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("Enter their first name");
    });

    it("should return status 400 after incorrect data entered", async () => {
        const sendData = {
            "first-name": "fname",
            "middle-names": "",
            "last-name": ""
        };
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_PERSONS_NAME_ON_PUBLIC_REGISTER).send(sendData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("Enter their last name");
    });

    it("should show the error page if an error occurs", async () => {
        const errorMessage = "Test error";
        jest.spyOn(localise, "getLocalesService").mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_PERSONS_NAME_ON_PUBLIC_REGISTER);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});

function createMockSessionMiddleware () {
    customMockSessionMiddleware = sessionMiddleware as jest.Mock;
    const session = getSessionRequestWithPermission();
    session.setExtraData(PREVIOUS_PAGE_URL, "/reverify-someones-identity-for-companies-house/check-your-answers?lang=en");
    session.setExtraData(USER_DATA, {
        firstName: "John",
        middleName: "",
        lastName: "Doe"
    });
    session.setExtraData(CHECK_YOUR_ANSWERS_FLAG, true);
    customMockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
        req.session = session;
        next();
    });
}
