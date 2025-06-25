import { NextFunction, Request, Response } from "express";
import { userIsPartOfAcspMiddleware } from "../../src/middleware/user_is_part_of_acsp_middleware";

jest.mock("../../src/middleware/user_is_part_of_acsp_middleware");

const mockUserIsPartOfAcspMiddleware = userIsPartOfAcspMiddleware as jest.Mock;

mockUserIsPartOfAcspMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

export default mockUserIsPartOfAcspMiddleware;
