import mocks from "../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../src/app";
import { BASE_URL, PERSONAL_CODE, EMAIL_ADDRESS, USE_NAME_ON_PUBLIC_REGISTER, PERSONS_NAME_ON_PUBLIC_REGISTER } from "../../../src/types/pageURL";
import { getPreviousPage } from "../../../src/controllers/personalCodeController";

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

describe("getPreviousPage function", () => {
    it("should return the correct previous page URL when selectedOption is 'use_name_on_public_register_no'", () => {
        const selectedOption = "use_name_on_public_register_no";
        const result = getPreviousPage(selectedOption);
        expect(result).toBe(BASE_URL + PERSONS_NAME_ON_PUBLIC_REGISTER);
    });

    it("should return the correct previous page URL when selectedOption is not 'use_name_on_public_register_no'", () => {
        const selectedOption = "use_name_on_public_register_yes";
        const result = getPreviousPage(selectedOption);
        expect(result).toBe(BASE_URL + USE_NAME_ON_PUBLIC_REGISTER);
    });
});
