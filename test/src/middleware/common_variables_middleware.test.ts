import { NextFunction, Request, Response } from "express";
import { commonTemplateVariablesMiddleware } from "../../../src/middleware/common_variables_middleware";
import * as sessionUtils from "../../../src/utils/session";
import { createResponse } from "node-mocks-http";

const getLoggedInAcspNumberSpy: jest.SpyInstance = jest.spyOn(sessionUtils, "getLoggedInAcspNumber");

const req: Request = {} as Request;
let res: Response = {} as Response;
const next: NextFunction = jest.fn();

describe("common template variables middleware tests", () => {

    beforeEach(() => {
        res = createResponse({
            locals: {}
        });
    });

    it("should display 'Your companies' navbar link when acsp number is valid", () => {
        getLoggedInAcspNumberSpy.mockReturnValue("AP12345");

        commonTemplateVariablesMiddleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.locals.displayAuthorisedAgent).toBe("yes");
    });

    it("should not display 'Your companies' navbar link when acsp number is undefined", () => {
        getLoggedInAcspNumberSpy.mockReturnValue(undefined);

        commonTemplateVariablesMiddleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.locals.displayAuthorisedAgent).toBe(undefined);
    });
});
