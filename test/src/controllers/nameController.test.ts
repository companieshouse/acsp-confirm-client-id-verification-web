import supertest from "supertest";
import app from "../../../src/app";
import { BASE_URL, PERSONS_NAME } from "../../../src/types/pageURL";


const router = supertest(app);


describe("GET" + PERSONS_NAME, () => {
    it("should return status 200", async () => {
        const res = await router.get(BASE_URL + PERSONS_NAME);
        expect(res.status).toBe(200);
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
    });

    // Test for incorrect form details entered, will return 400.
    it("should return status 400 after incorrect data entered", async () => {
        const res = await router.post(BASE_URL + PERSONS_NAME);
        expect(res.status).toBe(400);
    });
});
