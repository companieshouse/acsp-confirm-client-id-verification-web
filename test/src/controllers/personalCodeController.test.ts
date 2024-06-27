import mocks from "../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../src/app";
import { BASE_URL, PERSONAL_CODE, EMAIL_ADDRESS } from "../../../src/types/pageURL";

const router = supertest(app);

describe("GET " + PERSONAL_CODE, () => {

    it("should return status 200 with correct session data", async () => {
        const res = await router.get(BASE_URL + PERSONAL_CODE).query({ lang: "en" });
        expect(res.status).toBe(200);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    });
});

describe("POST " + PERSONAL_CODE, () => {
    it("should return status 302 after redirect with correct data", async () => {
        const res = await router.post(BASE_URL + PERSONAL_CODE)
            .send({ "first-name": "fname", "middle-names": "", "last-name": "lname" })
            .query({ lang: "en" });
        expect(res.status).toBe(302);
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.header.location).toBe(BASE_URL + EMAIL_ADDRESS + "?lang=en");
    });
});
