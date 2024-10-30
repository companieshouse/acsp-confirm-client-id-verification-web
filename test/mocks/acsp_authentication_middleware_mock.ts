import { NextFunction, Request, Response } from "express";
import { acspAuthMiddleware } from "../../src/middleware/acsp_authentication_middleware";

jest.mock("../../src/middleware/acsp_authentication_middleware");

// get handle on mocked function
const mockAcspAuthenticationMiddleware = acspAuthMiddleware as jest.Mock;

// tell the mock what to return
mockAcspAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

export default mockAcspAuthenticationMiddleware;
