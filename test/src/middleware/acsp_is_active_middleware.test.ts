import { NextFunction, Request, Response } from "express";
import { getSessionRequestWithPermission, acspNumber } from "../../mocks/session.mock";
import { InvalidAcspNumberError } from "@companieshouse/web-security-node";
import { acspIsActiveMiddleware } from "../../../src/middleware/acsp_is_active_middleware";
import { ACSP_DETAILS } from "../../../src/utils/constants";
import { getAcspFullProfile } from "../../../src/services/acspProfileService";
import { createRequest, MockRequest } from "node-mocks-http";
import { Session } from "@companieshouse/node-session-handler";

jest.mock("../../../src/services/acspProfileService");

describe("acspIsActiveMiddleware", () => {
    let req: MockRequest<Request>;
    const res: Response = {} as Response;
    const next: NextFunction = jest.fn();

    beforeEach(() => {
        req = createRequest({
            method: "GET",
            url: "/"
        });
        const session = getSessionRequestWithPermission();
        req.session = session;
    });

    it("should call next() when ACSP is active and details exist in session", async () => {
        const session = req.session as any as Session;
        session.setExtraData(ACSP_DETAILS, { status: "active" });

        await acspIsActiveMiddleware(req, res, next);

        expect(next).toHaveBeenCalledWith();
        expect(getAcspFullProfile).not.toHaveBeenCalled();
    });

    it("should fetch ACSP details when not in session", async () => {
        const session = req.session as any as Session;
        await acspIsActiveMiddleware(req, res, next);

        expect(getAcspFullProfile).toHaveBeenCalledWith(acspNumber);
        expect(next).toHaveBeenCalled();
    });

    it("should throw InvalidAcspNumberError when ACSP status is not active", async () => {
        const session = req.session as any as Session;
        session.setExtraData(ACSP_DETAILS, { status: "ceased" });

        await acspIsActiveMiddleware(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.any(InvalidAcspNumberError)
        );
    });

    it("should pass through any caught errors", async () => {
        const error = new Error("Test error");
        (getAcspFullProfile as jest.Mock).mockImplementation(() => {
            throw error;
        });

        await acspIsActiveMiddleware(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});
