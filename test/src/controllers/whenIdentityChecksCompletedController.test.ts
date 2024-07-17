import mocks from "../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../src/app";
import { BASE_URL, WHEN_IDENTITY_CHECKS_COMPLETED, HOW_IDENTITY_DOCUMENTS_CHECKED } from "../../../src/types/pageURL";

const router = supertest(app);

describe("GET" + WHEN_IDENTITY_CHECKS_COMPLETED, () => {
    it("should return status 200", async () => {
        const res = await router.get(BASE_URL + WHEN_IDENTITY_CHECKS_COMPLETED);
        expect(res.status).toBe(200);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.text).toContain("When were the identity checks completed?");
    });
});

describe("POST" + WHEN_IDENTITY_CHECKS_COMPLETED, () => {
    // Test for correct form details entered, will return 302 after redirecting to the next page.
    it("should return status 302 after redirect", async () => {
        const sendData = {
            "wicc-day": "08",
            "wicc-month": "07",
            "wicc-year": "2024"
        };
        const res = await router.post(BASE_URL + WHEN_IDENTITY_CHECKS_COMPLETED).send(sendData);
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(BASE_URL + HOW_IDENTITY_DOCUMENTS_CHECKED + "?lang=en");
    });

    // Test for incorrect form details entered, will return 400.
    it("should return status 400", async () => {
        const sendData = {
            "wicc-day": "",
            "wicc-month": undefined,
            "wicc-year": ""
        };
        const res = await router.post(BASE_URL + WHEN_IDENTITY_CHECKS_COMPLETED).send(sendData); ;
        expect(res.status).toBe(400);
        expect(res.text).toContain("When were the identity checks completed?");
    });
});
