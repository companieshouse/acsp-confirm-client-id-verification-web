import mocks from "../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../src/app";
import { BASE_URL, PERSONAL_CODE, EMAIL_ADDRESS, USE_NAME_ON_PUBLIC_REGISTER, PERSONS_NAME_ON_PUBLIC_REGISTER } from "../../../src/types/pageURL";
import * as localise from "../../../src/utils/localise";
import { USE_NAME_ON_PUBLIC_REGISTER_NO, USE_NAME_ON_PUBLIC_REGISTER_YES } from "../../../src/utils/constants";

const router = supertest(app);

describe("GET " + PERSONAL_CODE, () => {

    it("should return status 200 with correct session data", async () => {
        const res = await router.get(BASE_URL + PERSONAL_CODE).query({ lang: "en" });
        expect(res.status).toBe(200);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    });

    it("should show the error page if an error occurs", async () => {
        const errorMessage = "Test error";
        jest.spyOn(localise, "getLocalesService").mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.get(BASE_URL + PERSONAL_CODE);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});

it("should return the correct previous page URL when selectedOption is 'use_name_on_public_register_no'", async () => {
    const mockSessionData = {
        getExtraData: jest.fn().mockReturnValue({
            useNameOnPublicRegister: USE_NAME_ON_PUBLIC_REGISTER_NO
        })
    };
    mocks.mockSessionMiddleware.mockImplementation((req, res, next) => {
        req.session = mockSessionData;
        next();
    });

    const res = await router.get(BASE_URL + PERSONAL_CODE).query({ lang: "en" });
    expect(res.status).toBe(200);
    expect(res.text).toContain(BASE_URL + PERSONS_NAME_ON_PUBLIC_REGISTER);
});

it("should return the correct previous page URL when selectedOption is 'use_name_on_public_register_no'", async () => {
    const mockSessionData = {
        getExtraData: jest.fn().mockReturnValue({
            useNameOnPublicRegister: USE_NAME_ON_PUBLIC_REGISTER_YES
        })
    };
    mocks.mockSessionMiddleware.mockImplementation((req, res, next) => {
        req.session = mockSessionData;
        next();
    });

    const res = await router.get(BASE_URL + PERSONAL_CODE).query({ lang: "en" });
    expect(res.status).toBe(200);
    expect(res.text).toContain(BASE_URL + USE_NAME_ON_PUBLIC_REGISTER);
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

    it("should show the error page if an error occurs", async () => {
        const errorMessage = "Test error";
        jest.spyOn(localise, "getLocalesService").mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.get(BASE_URL + PERSONAL_CODE);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});
