import mocks from "../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../src/app";
import { AUTHORISED_AGENT, BASE_URL, HOME_URL, PERSONS_NAME } from "../../../src/types/pageURL";
import { get } from "../../../src/controllers/indexController";
import { NextFunction, Request, Response } from "express";
import { CHECK_YOUR_ANSWERS_FLAG, REFERENCE, USER_DATA } from "../../../src/utils/constants";
import { Session } from "@companieshouse/node-session-handler";
import * as localise from "../../../src/utils/localise";

const router = supertest(app);

describe("Home Page tests -", () => {

    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;
    let sessionMock: Partial<Session>;

    beforeEach(() => {
        sessionMock = {
            deleteExtraData: jest.fn()
        };
        req = {
            headers: {},
            session: sessionMock as Session
        };
        res = {
            render: jest.fn()
        };
        next = jest.fn();
    });

    describe("GET " + HOME_URL, () => {
        it("should return status 200", async () => {
            const res = await router.get(BASE_URL + HOME_URL);
            await router.get(BASE_URL);
            expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
            expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
            expect(mocks.mockAcspAuthenticationMiddleware).toHaveBeenCalled();
            expect(200);
            expect(res.text).toContain("Tell Companies House you have verified someone’s identity");
        });

        it("should clear session data when referer is from an external site e.g. authorised agent", async () => {
            req.headers!.referer = `${AUTHORISED_AGENT}`;
            req.query = { lang: "en" };

            await get(req as Request, res as Response, next);

            expect(sessionMock.deleteExtraData).toHaveBeenCalledWith(USER_DATA);
            expect(sessionMock.deleteExtraData).toHaveBeenCalledWith(CHECK_YOUR_ANSWERS_FLAG);
            expect(sessionMock.deleteExtraData).toHaveBeenCalledWith(REFERENCE);

        });

        it("should show the error page if an error occurs", async () => {
            const errorMessage = "Test error";
            jest.spyOn(localise, "selectLang").mockImplementationOnce(() => {
                throw new Error(errorMessage);
            });
            const res = await router.get(BASE_URL + HOME_URL);
            expect(res.status).toBe(500);
            expect(res.text).toContain("Sorry we are experiencing technical difficulties");
        });
    });

    describe("POST " + HOME_URL, () => {
        it("should return status 302 after redirect with correct data", async () => {
            const res = await router.post(BASE_URL + HOME_URL);
            expect(res.status).toBe(302);
            expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
            expect(res.header.location).toBe(BASE_URL + PERSONS_NAME + "?lang=en");
        });

        it("should show the error page if an error occurs", async () => {
            const errorMessage = "Test error";
            jest.spyOn(localise, "selectLang").mockImplementationOnce(() => {
                throw new Error(errorMessage);
            });
            const res = await router.post(BASE_URL + HOME_URL);
            expect(res.status).toBe(500);
            expect(res.text).toContain("Sorry we are experiencing technical difficulties");
        });
    });
});
