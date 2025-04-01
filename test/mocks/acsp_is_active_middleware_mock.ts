import { Request, Response, NextFunction } from "express";
import { acspIsActiveMiddleware } from "../../src/middleware/acsp_is_active_middleware";

jest.mock("../../src/middleware/acsp_is_active_middleware");

const mockAcspIsActiveMiddleware = acspIsActiveMiddleware as jest.Mock;

mockAcspIsActiveMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

export default mockAcspIsActiveMiddleware;
