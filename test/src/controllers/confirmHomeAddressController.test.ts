import mocks from "../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../src/app";
import { CONFIRM_HOME_ADDRESS, BASE_URL, WHEN_IDENTITY_CHECKS_COMPLETED } from "../../../src/types/pageURL";
jest.mock("@companieshouse/api-sdk-node");
const router = supertest(app);

describe("GET" + CONFIRM_HOME_ADDRESS, () => {
    it("should render the confirmation page with status 200 ans display the information on the screen", async () => {
        const res = await router.get(BASE_URL + CONFIRM_HOME_ADDRESS);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.status).toBe(200);
        expect(res.text).toContain("Confirm their home address");
    });
});

describe("POST CONFIRM_HOME_ADDRESS", () => {
    it("should return status 302 after redirect", async () => {
        const res = await router.post(BASE_URL + CONFIRM_HOME_ADDRESS);
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(BASE_URL + WHEN_IDENTITY_CHECKS_COMPLETED + "?lang=en");
    });
});
