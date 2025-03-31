import { NextFunction, Request, Response } from "express";
import { ensureSessionCookiePresentMiddleware, sessionMiddleware } from "../../src/middleware/session_middleware";
import { USER_DATA, ADDRESS_LIST, PREVIOUS_PAGE_URL, ACSP_DETAILS } from "../../src/utils/constants";
import { getSessionRequestWithPermission } from "./session.mock";
import { addressList } from "./address.mock";
import { dummyFullProfile } from "./acsp_profile.mock";

jest.mock("ioredis");
jest.mock("../../src/middleware/session_middleware");

// get handle on mocked function
const mockSessionMiddleware = sessionMiddleware as jest.Mock;
const mockEnsureSessionCookiePresentMiddleware = ensureSessionCookiePresentMiddleware as jest.Mock;

export const session = getSessionRequestWithPermission();

// tell the mock what to return
mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
    session.setExtraData(USER_DATA, {
        firstName: "John",
        middleName: "",
        lastName: "Doe",
        howIdentityDocsChecked: "cryptographic_security_features_checked",
        whenIdentityChecksCompleted: new Date(2024, 2, 5),
        dateOfBirth: new Date(2000, 2, 5)
    }
    );
    session.setExtraData(ADDRESS_LIST, addressList);
    session.setExtraData(PREVIOUS_PAGE_URL, "tell-companies-house-you-have-verified-someones-identity/what-is-the-persons-name");
    session.setExtraData(ACSP_DETAILS, dummyFullProfile);

    req.session = session;
    next();
});

mockEnsureSessionCookiePresentMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
    next();
});

export { mockSessionMiddleware, mockEnsureSessionCookiePresentMiddleware };
