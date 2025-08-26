import mocks from "../../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../../src/app";
import { REVERIFY_SHOW_ON_PUBLIC_REGISTER, REVERIFY_BASE_URL, REVERIFY_DATE_OF_BIRTH, REVERIFY_PERSONS_NAME_ON_PUBLIC_REGISTER, REVERIFY_CHECK_YOUR_ANSWERS } from "../../../../src/types/pageURL";
import { sessionMiddleware } from "../../../../src/middleware/session_middleware";
import { getSessionRequestWithPermission } from "../../../mocks/session.mock";
import { PREVIOUS_PAGE_URL, USER_DATA } from "../../../../src/utils/constants";
import { Request, Response, NextFunction } from "express";
import * as localise from "../../../../src/utils/localise";

const router = supertest(app);

let customMockSessionMiddleware: any;

describe("GET" + REVERIFY_SHOW_ON_PUBLIC_REGISTER, () => {
    it("should return status 200", async () => {
        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_SHOW_ON_PUBLIC_REGISTER);
        expect(res.status).toBe(200);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    });

    it("should return status 200 when accessing page directly from check your answers URL", async () => {
        const res = await router
            .get(REVERIFY_BASE_URL + REVERIFY_SHOW_ON_PUBLIC_REGISTER)
            .set("Referer", REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS + "?lang=en");
        expect(res.status).toBe(200);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    });

    it("should show the error page if an error occurs", async () => {
        const errorMessage = "Test error";
        jest.spyOn(localise, "getLocalesService").mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_SHOW_ON_PUBLIC_REGISTER);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});

describe("POST" + REVERIFY_SHOW_ON_PUBLIC_REGISTER, () => {
    it("should return status 302 after redirect - option 1 selected", async () => {
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_SHOW_ON_PUBLIC_REGISTER).send({ useNameOnPublicRegisterRadio: "use_name_on_public_register_yes" });
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(REVERIFY_BASE_URL + REVERIFY_DATE_OF_BIRTH + "?lang=en");
    });

    it("should return status 302 after redirect - option 2 selected", async () => {
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_SHOW_ON_PUBLIC_REGISTER).send({ useNameOnPublicRegisterRadio: "use_name_on_public_register_no" });
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(REVERIFY_BASE_URL + REVERIFY_PERSONS_NAME_ON_PUBLIC_REGISTER + "?lang=en");
    });

    it("should return status 400 after no radio button selected entered", async () => {
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_SHOW_ON_PUBLIC_REGISTER).send({ useNameOnPublicRegisterRadio: "" });
        expect(res.status).toBe(400);
        expect(res.text).toContain("Select if we can use the name on the public register");
    });

    it("should return status 302 after redirect to Check Your Answers - option 1 selected", async () => {
        createMockSessionMiddleware();
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_SHOW_ON_PUBLIC_REGISTER).send({ useNameOnPublicRegisterRadio: "use_name_on_public_register_yes" });
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS + "?lang=en");
    });

    it("should show the error page if an error occurs", async () => {
        const errorMessage = "Test error";
        jest.spyOn(localise, "getLocalesService").mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_SHOW_ON_PUBLIC_REGISTER);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });

    it("should show technical difficulties screen if session is undefined", async () => {
        const undefinedSessionMockMiddleware = sessionMiddleware as jest.Mock;
        undefinedSessionMockMiddleware.mockImplementationOnce((req: Request, res: Response, next: NextFunction) => {
            req.session = undefined;
            next();
        });

        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_SHOW_ON_PUBLIC_REGISTER)
            .send({ useNameOnPublicRegisterRadio: "use_name_on_public_register_yes" });

        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});

function createMockSessionMiddleware () {
    customMockSessionMiddleware = sessionMiddleware as jest.Mock;
    const session = getSessionRequestWithPermission();
    session.setExtraData(PREVIOUS_PAGE_URL, REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS + "?lang=en");
    session.setExtraData(USER_DATA, {
        firstName: "John",
        lastName: "Doe",
        preferredFirstName: "",
        preferredMiddleName: "",
        preferredLastName: ""
    });
    customMockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
        req.session = session;
        next();
    });
}
