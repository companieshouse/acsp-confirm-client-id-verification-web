import mocks from "../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../src/app";
import { BASE_URL, PERSONS_NAME, PERSONAL_CODE } from "../../../src/types/pageURL";

const router = supertest(app);

describe("GET" + PERSONS_NAME, () => {
    it("should return status 200", async () => {
        const res = await router.get(BASE_URL + PERSONS_NAME);
        expect(res.status).toBe(200);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    });
});

describe("POST" + PERSONS_NAME, () => {
    // Test for correct form details entered, will return 302 after redirecting to the next page.
    it("should return status 302 after redirect", async () => {
        const res = await router.post(BASE_URL + PERSONS_NAME)
            .send({
                "first-name": "John",
                "middle-names": "",
                "last-name": "Doe"
            });
        expect(res.status).toBe(302);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.header.location).toBe(BASE_URL + PERSONAL_CODE + "?lang=en");
    });

    // Test for incorrect form details entered, will return 400.
    it("should return status 400 after incorrect data entered", async () => {
        const sendData = {
            "first-name": "",
            "middle-names": "",
            "last-name": ""
        };
        const res = await router.post(BASE_URL + PERSONS_NAME).send(sendData); ;
        expect(res.status).toBe(400);
    });
});
