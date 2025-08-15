/* eslint-disable import/first */

jest.mock("@companieshouse/web-security-node");

import { acspManageUsersAuthMiddleware, AuthOptions } from "@companieshouse/web-security-node";
import { Request, Response } from "express";
import { BASE_URL, PERSONS_NAME, REVERIFY_BASE_URL } from "../../../src/types/pageURL";
import * as sessionUtils from "../../../src/utils/session";
import { acspAuthMiddleware } from "../../../src/middleware/acsp_authentication_middleware";

// get handle on mocked function and create mock function to be returned from calling authMiddleware
const mockAuthMiddleware = acspManageUsersAuthMiddleware as jest.Mock;
const mockAuthReturnedFunction = jest.fn();

// when the mocked authMiddleware is called, make it return a mocked function so we can verify it gets called
mockAuthMiddleware.mockReturnValue(mockAuthReturnedFunction);

const getLoggedInAcspNumberSpy: jest.SpyInstance = jest.spyOn(sessionUtils, "getLoggedInAcspNumber");

const res: Response = {} as Response;
const next = jest.fn();

describe("acsp authentication middleware tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        getLoggedInAcspNumberSpy.mockReturnValue("ABC123");
    });

    it("should call CH authentication library with BASE_URL for verify service", () => {
        const req: Request = {
            originalUrl: BASE_URL + PERSONS_NAME
        } as Request;

        const expectedConfig: AuthOptions = {
            chsWebUrl: "http://chs.local",
            returnUrl: BASE_URL,
            acspNumber: "ABC123"
        };

        acspAuthMiddleware(req, res, next);
        expect(mockAuthMiddleware).toHaveBeenCalledWith(expectedConfig);
        expect(mockAuthReturnedFunction).toHaveBeenCalledWith(req, res, next);
    });

    it("should call CH authentication library with REVERIFY_BASE_URL for reverify service", () => {
        const req: Request = {
            originalUrl: REVERIFY_BASE_URL + "/test-path"
        } as Request;

        const expectedConfig: AuthOptions = {
            chsWebUrl: "http://chs.local",
            returnUrl: REVERIFY_BASE_URL,
            acspNumber: "ABC123"
        };

        acspAuthMiddleware(req, res, next);
        expect(mockAuthMiddleware).toHaveBeenCalledWith(expectedConfig);
        expect(mockAuthReturnedFunction).toHaveBeenCalledWith(req, res, next);
    });
});
