import mocks from "../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../src/app";
import { BASE_URL, CONFIRM_IDENTITY_VERIFICATION, IDENTITY_DOCUMETS_IDV } from "../../../src/types/pageURL";
jest.mock("@companieshouse/api-sdk-node");

const router = supertest(app);

describe("GET" + IDENTITY_DOCUMETS_IDV, () => {
    it("should return status 200", async () => {
        const res = await router.get(BASE_URL + IDENTITY_DOCUMETS_IDV);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.status).toBe(200);
        expect(res.text).toContain("Which documents did you check to verify their identity?");
        expect(res.text).toContain("John");
        expect(res.text).toContain("Doe");
    });
});

describe("POST" + IDENTITY_DOCUMETS_IDV, () => {
    it("should return status 302 after redirecting to the next page", async () => {
        const inputData = {
            documents: ["biometricPassport", "ukDriversLicence"]
        };
        const res = await router.post(BASE_URL + IDENTITY_DOCUMETS_IDV).send(inputData);
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(BASE_URL + CONFIRM_IDENTITY_VERIFICATION + "?lang=en");
    });
});
