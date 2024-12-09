import mocks from "../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../src/app";
import { BASE_URL, USE_NAME_ON_PUBLIC_REGISTER, PERSONAL_CODE } from "../../../src/types/pageURL";

jest.mock("../../../src/services/identityVerificationService");

const router = supertest(app);

describe("GET" + USE_NAME_ON_PUBLIC_REGISTER, () => {
    it("should return status 200", async () => {
        const res = await router.get(BASE_URL + USE_NAME_ON_PUBLIC_REGISTER);
        expect(res.status).toBe(200);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    });
});

describe("POST" + USE_NAME_ON_PUBLIC_REGISTER, () => {
    it("should return status 302 after redirect - option 1 selected", async () => {
        const res = await router.post(BASE_URL + USE_NAME_ON_PUBLIC_REGISTER).send({ useNameOnPublicRegisterRadio: "use_name_on_public_register_yes" });
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(BASE_URL + PERSONAL_CODE + "?lang=en");
    });

    it("should return status 302 after redirect - option 2 selected", async () => {
        const res = await router.post(BASE_URL + USE_NAME_ON_PUBLIC_REGISTER).send({ useNameOnPublicRegisterRadio: "use_name_on_public_register_no" });
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(BASE_URL + "#" + "?lang=en");
    });

    it("should return status 400 after no radio button selected entered", async () => {
        const res = await router.post(BASE_URL + USE_NAME_ON_PUBLIC_REGISTER).send({ useNameOnPublicRegisterRadio: "" });
        expect(res.status).toBe(400);
        expect(res.text).toContain("Select if we can use the name on the public register");
    });
});
