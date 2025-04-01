import { clearSessionAfterConfirmation } from "../../../src/middleware/clear_session_after_confirmation_middleware";
import { Request, Response, NextFunction } from "express";
import { CONFIRMATION, PERSONS_NAME } from "../../../src/types/pageURL";
import { CHECK_YOUR_ANSWERS_FLAG, USER_DATA } from "../../../src/utils/constants";
import { Session } from "@companieshouse/node-session-handler";

describe("clearSessionAfterConfirmation Middleware", () => {
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

        res = {};
        next = jest.fn();
    });

    it("should clear session data when navigating away from the confirmation page", () => {
        req.headers!.referer = `${CONFIRMATION}`;
        req.query = {};

        clearSessionAfterConfirmation(req as Request, res as Response, next);

        expect(sessionMock.deleteExtraData).toHaveBeenCalledWith(USER_DATA);
        expect(sessionMock.deleteExtraData).toHaveBeenCalledWith(CHECK_YOUR_ANSWERS_FLAG);
        expect(next).toHaveBeenCalled();
    });

    it("should not clear session data when referer does not include the confirmation page", () => {
        req.headers!.referer = `${PERSONS_NAME}`;

        clearSessionAfterConfirmation(req as Request, res as Response, next);

        expect(sessionMock.deleteExtraData).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
    });

    it("should not clear session data when lang is switched on the confirmation page", () => {
        req.headers!.referer = `${CONFIRMATION}`;
        req.query = { lang: "cy" };

        clearSessionAfterConfirmation(req as Request, res as Response, next);

        expect(sessionMock.deleteExtraData).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
    });
});
