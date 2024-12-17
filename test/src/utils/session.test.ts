import { getSessionRequestWithPermission, userId, userMail, acspNumber } from "../../mocks/session.mock";
import { getLoggedInAcspNumber, getLoggedInUserEmail, getLoggedInUserId } from "../../../src/utils/session";

describe("Session util tests", () => {

    it("should return users email address", () => {
        const session = getSessionRequestWithPermission();
        const res = getLoggedInUserEmail(session);

        expect(res).toBe(userMail);
    });

    it("should return users userId", () => {
        const session = getSessionRequestWithPermission();
        const res = getLoggedInUserId(session);

        expect(res).toBe(userId);
    });

    it("should return acsp number", () => {
        const session = getSessionRequestWithPermission();
        const res = getLoggedInAcspNumber(session);

        expect(res).toBe(acspNumber);
    });
});
