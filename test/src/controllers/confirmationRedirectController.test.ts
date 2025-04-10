import mocks from "../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../src/app";
import { AUTHORISED_AGENT, BASE_URL, CONFIRMATION_REDIRECT } from "../../../src/types/pageURL";
import { createRequest } from "node-mocks-http";
import { getSessionRequestWithPermission } from "../../mocks/session.mock";
import { CHECK_YOUR_ANSWERS_FLAG, USER_DATA } from "../../../src/utils/constants";
import { session } from "../../mocks/session_middleware_mock";
import * as localise from "../../../src/utils/localise";

const router = supertest(app);

describe("GET " + CONFIRMATION_REDIRECT, () => {
    let req;
    beforeEach(() => {
        jest.clearAllMocks();
        req = createRequest({
            method: "GET",
            url: "/"
        });
        const session = getSessionRequestWithPermission();
        req.session = session;
    });

    it("should redirect to BASE_URL and clear session data when id is verify-service-link", async () => {

        const res = await router
            .get(BASE_URL + CONFIRMATION_REDIRECT)
            .query({ id: "verify-service-link" });

        expect(res.status).toBe(302);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(res.header.location).toBe(BASE_URL + "?lang=en");
        expect(session.getExtraData(USER_DATA)).toBeUndefined();
        expect(session.getExtraData(CHECK_YOUR_ANSWERS_FLAG)).toBeUndefined();
    });

    it("should redirect to AUTHORISED_AGENT and clear session data when id is authorised-agent-account-link", async () => {
        const res = await router
            .get(BASE_URL + CONFIRMATION_REDIRECT)
            .query({ id: "authorised-agent-account-link" });

        expect(res.status).toBe(302);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(res.header.location).toBe(AUTHORISED_AGENT + "?lang=en");
        expect(session.getExtraData(USER_DATA)).toBeUndefined();
        expect(session.getExtraData(CHECK_YOUR_ANSWERS_FLAG)).toBeUndefined();
    });

    it("should redirect to BASE_URL and clear session data when id is service-url-link", async () => {

        const res = await router
            .get(BASE_URL + CONFIRMATION_REDIRECT)
            .query({ id: "service-url-link" });

        expect(res.status).toBe(302);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(res.header.location).toBe(BASE_URL + "?lang=en");
        expect(session.getExtraData(USER_DATA)).toBeUndefined();
        expect(session.getExtraData(CHECK_YOUR_ANSWERS_FLAG)).toBeUndefined();
    });

    it("should return status 500 if an error occurs", async () => {
        jest.spyOn(localise, "selectLang").mockImplementationOnce(() => {
            throw new Error("Test error");
        });
        const res = await router.get(BASE_URL + CONFIRMATION_REDIRECT);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});
