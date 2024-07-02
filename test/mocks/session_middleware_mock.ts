import { NextFunction, Request, Response } from "express";
import { sessionMiddleware } from "../../src/middleware/session_middleware";
import { USER_DATA, ADDRESS_LIST } from "../../src/utils/constants";
import { getSessionRequestWithPermission } from "./session.mock";
import { addressList } from "./address.mock";
import { HOME_ADDRESS } from "../../src/types/pageURL"


jest.mock("ioredis");
jest.mock("../../src/middleware/session_middleware");

// get handle on mocked function
export const mockSessionMiddleware = sessionMiddleware as jest.Mock;

export const session = getSessionRequestWithPermission();

// tell the mock what to return
mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
    session.setExtraData(USER_DATA, {
        firstName: "John",
        middleName: "",
        lastName: "Doe"
    }
    );
    session.setExtraData(ADDRESS_LIST, addressList);

    req.session = session;
    next();
});

export default mockSessionMiddleware;
