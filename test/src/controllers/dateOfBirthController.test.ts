import mocks from "../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../src/app";
import { BASE_URL, DATE_OF_BIRTH, WHEN_IDENTITY_CHECKS_COMPLETED } from "../../../src/types/pageURL";

const router = supertest(app);


describe("GET" + DATE_OF_BIRTH, () => {
    it("should return status 200", async () => {
        const res = await router.get(BASE_URL + DATE_OF_BIRTH);
        expect(res.status).toBe(200);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.text).toContain("What is their date of birth?");
    });
});

describe("POST" + DATE_OF_BIRTH, () => {
    // Test for correct form details entered, will return 302 after redirecting to the next page.
    it("should return status 302 after redirect", async () => {
        const sendData = {
            "dob-day": "11",
            "dob-month": "2",
            "dob-year": "1999"
        };
        const res = await router.post(BASE_URL + DATE_OF_BIRTH).send(sendData);
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(BASE_URL + WHEN_IDENTITY_CHECKS_COMPLETED + "?lang=en");
    });

    // Test for incorrect form details entered, will return 400.
    it("should return status 400", async () => {
        const sendData = {
            "dob-day": "",
            "dob-month": undefined,
            "dob-year": ""
        };
        const res = await router.post(BASE_URL + DATE_OF_BIRTH).send(sendData); ;
        expect(res.status).toBe(400);
        expect(res.text).toContain("Enter your date of birth");
    });
});
