import mocks from "../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../src/app";
import { BASE_URL, EMAIL_ADDRESS, DATE_OF_BIRTH, PROVIDE_DIFFERENT_EMAIL } from "../../../src/types/pageURL";
import { findIdentityByEmail } from "../../../src/services/identityVerificationService";
import { dummyIdentity } from "../../mocks/identity.mock";

jest.mock("../../../src/services/identityVerificationService");

const mockFindIdentityByEmail = findIdentityByEmail as jest.Mock;

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
        await mockFindIdentityByEmail.mockResolvedValueOnce(undefined);
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

    // Test for when email exists in verification api to redirect to stop screen
    it("should return status 302 if email address exists in verification api and redirect to stop screen", async () => {
        await mockFindIdentityByEmail.mockResolvedValueOnce(dummyIdentity);
        const res = await router.post(BASE_URL + EMAIL_ADDRESS)
            .send({
                "email-address": "test@gmail.com",
                confirm: "test@gmail.com"
            });
        expect(res.status).toBe(302);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.header.location).toBe(BASE_URL + PROVIDE_DIFFERENT_EMAIL + "?lang=en");
    });

    // Test for incorrect form details entered, will return 400.
    it("should return status 400 after incorrect data entered", async () => {
        const sendData = {
            "email-address": "test@gmail.com",
            confirm: ""
        };
        const res = await router.post(BASE_URL + EMAIL_ADDRESS).send(sendData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("Enter their email address");
    });

    it("should return status 400 after incorrect data entered", async () => {
        const sendData = {
            "email-address": "",
            confirm: "test@gmail.com"
        };
        const res = await router.post(BASE_URL + EMAIL_ADDRESS).send(sendData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("Enter their email address");
    });

    it("should return status 400 after incorrect data entered", async () => {
        const sendData = {
            "email-address": "test@gmail.com",
            confirm: "different@gmail.com"
        };
        const res = await router.post(BASE_URL + EMAIL_ADDRESS).send(sendData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("Email addresses must match");
    });

    it("should return status 500 if verification api errors", async () => {
        await mockFindIdentityByEmail.mockRejectedValueOnce(new Error("Verification API error"));
        const res = await router.post(BASE_URL + EMAIL_ADDRESS)
            .send({
                "email-address": "test@email.com",
                confirm: "test@email.com"
            });
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});
