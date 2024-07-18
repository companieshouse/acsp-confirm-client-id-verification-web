import mocks from "../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../src/app";
import { BASE_URL, PERSONS_NAME, PERSONAL_CODE, EMAIL_ADDRESS, DATE_OF_BIRTH } from "../../../src/types/pageURL";

const router = supertest(app);

describe("GET" + EMAIL_ADDRESS, () => {
    it("should return status 200", async () => {
        const res = await router.get(BASE_URL + EMAIL_ADDRESS);
        expect(res.status).toBe(200);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    });
});

describe("POST" + EMAIL_ADDRESS, () => {
    // Test for correct form details entered, will return 302 after redirecting to the next page.
    it("should return status 302 after redirect", async () => {
        const res = await router.post(BASE_URL + EMAIL_ADDRESS)
            .send({
                "email-address": "test@gmail.com",
                confirm: "test@gmail.com"
            });
        expect(res.status).toBe(302);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.header.location).toBe(BASE_URL + DATE_OF_BIRTH + "?lang=en");
    });

    // Test for incorrect form details entered, will return 400.
    it("should return status 400 after incorrect data entered", async () => {
        const sendData = {
            "email-address": "test@gmail.com",
            confirm: ""
        };
        const res = await router.post(BASE_URL + EMAIL_ADDRESS).send(sendData); ;
        expect(res.status).toBe(400);
        expect(res.text).toContain("Enter their email address");
    });

    it("should return status 400 after incorrect data entered", async () => {
        const sendData = {
            "email-address": "",
            confirm: "test@gmail.com"
        };
        const res = await router.post(BASE_URL + EMAIL_ADDRESS).send(sendData); ;
        expect(res.status).toBe(400);
        expect(res.text).toContain("Enter their email address");
    });

    it("should return status 400 after incorrect data entered", async () => {
        const sendData = {
            "email-address": "test@gmail.com",
            confirm: "different@gmail.com"
        };
        const res = await router.post(BASE_URL + EMAIL_ADDRESS).send(sendData); ;
        expect(res.status).toBe(400);
        expect(res.text).toContain("Email addresses must match");
    });
});
