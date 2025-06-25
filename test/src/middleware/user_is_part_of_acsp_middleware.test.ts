import { Request, Response } from "express";
import * as sessionUtils from "../../../src/utils/session";
import { userIsPartOfAcspMiddleware } from "../../../src/middleware/user_is_part_of_acsp_middleware";
import { createRequest, MockRequest } from "node-mocks-http";
import { getSessionRequestWithPermission } from "../../mocks/session.mock";
import * as localise from "../../../src/utils/localise";

const getLoggedInAcspNumberSpy: jest.SpyInstance = jest.spyOn(sessionUtils, "getLoggedInAcspNumber");

describe("userIsPartOfAcspMiddleware", () => {
    let req: MockRequest<Request>;
    let res: Partial<Response>;
    const next = jest.fn();

    beforeEach(() => {
        req = createRequest({
            method: "GET",
            url: "/"
        });
        res = {
            redirect: jest.fn()
        };
        const session = getSessionRequestWithPermission();
        req.session = session;
    });

    it("should call res.redirect() if no acspNumber in session", async () => {
        getLoggedInAcspNumberSpy.mockReturnValue(undefined);
        userIsPartOfAcspMiddleware(req, res as Response, next);
        expect(res.redirect).toHaveBeenCalledTimes(1);
        expect(next).not.toHaveBeenCalled();
    });

    it("should call next() when acspNumber is present in session", async () => {
        getLoggedInAcspNumberSpy.mockReturnValue("ABC123");
        userIsPartOfAcspMiddleware(req, res as Response, next);
        expect(next).toHaveBeenCalled();
        expect(res.redirect).not.toHaveBeenCalled();
    });

    it("should pass through any caught errors", async () => {
        const error = new Error("Test error");
        jest.spyOn(localise, "selectLang").mockImplementationOnce(() => {
            throw error;
        });

        await userIsPartOfAcspMiddleware(req, res as Response, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});
