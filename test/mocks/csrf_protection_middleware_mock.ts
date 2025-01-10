import { NextFunction, Request, Response } from "express";
import { csrfProtectionMiddleware } from "../../src/middleware/csrf_protection_middleware";

jest.mock("../../src/middleware/csrf_protection_middleware");

const mockCsrfProtectionMiddleware = csrfProtectionMiddleware as jest.Mock;

mockCsrfProtectionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

export default mockCsrfProtectionMiddleware;