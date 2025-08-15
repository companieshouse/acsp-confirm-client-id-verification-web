/* eslint-disable import/first */

jest.mock("@companieshouse/web-security-node");

import { authMiddleware, AuthOptions } from "@companieshouse/web-security-node";
import { Request, Response } from "express";
import { authenticationMiddleware } from "../../../src/middleware/authentication_middleware";
import { BASE_URL, REVERIFY_BASE_URL, PERSONS_NAME } from "../../../src/types/pageURL";

// get handle on mocked function and create mock function to be returned from calling authMiddleware
const mockAuthMiddleware = authMiddleware as jest.Mock;
const mockAuthReturnedFunction = jest.fn();

// when the mocked authMiddleware is called, make it return a mocked function so we can verify it gets called
mockAuthMiddleware.mockReturnValue(mockAuthReturnedFunction);

const res: Response = {} as Response;
const next = jest.fn();

describe("authentication middleware tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should call CH authentication library with BASE_URL for verify service", () => {
        const req: Request = {
            originalUrl: BASE_URL + PERSONS_NAME
        } as Request;

        const expectedConfig: AuthOptions = {
            chsWebUrl: "http://chs.local",
            returnUrl: BASE_URL
        };

        authenticationMiddleware(req, res, next);
        expect(mockAuthMiddleware).toHaveBeenCalledWith(expectedConfig);
        expect(mockAuthReturnedFunction).toHaveBeenCalledWith(req, res, next);
    });

    it("should call CH authentication library with REVERIFY_BASE_URL for reverify service", () => {
        const req: Request = {
            originalUrl: REVERIFY_BASE_URL + "/test-path"
        } as Request;

        const expectedConfig: AuthOptions = {
            chsWebUrl: "http://chs.local",
            returnUrl: REVERIFY_BASE_URL
        };

        authenticationMiddleware(req, res, next);
        expect(mockAuthMiddleware).toHaveBeenCalledWith(expectedConfig);
        expect(mockAuthReturnedFunction).toHaveBeenCalledWith(req, res, next);
    });
});
