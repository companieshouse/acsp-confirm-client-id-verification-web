import mocks from "../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../src/app";
import { BASE_URL, CHECK_YOUR_ANSWERS, CONFIRMATION, PROVIDE_DIFFERENT_EMAIL } from "../../../src/types/pageURL";
import { findIdentityByEmail, sendVerifiedClientDetails } from "../../../src/services/identityVerificationService";
import { dummyIdentity } from "../../mocks/identity.mock";
jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../../src/services/identityVerificationService.ts");

const mockSendVerifiedClientDetails = sendVerifiedClientDetails as jest.Mock;
const mockFindIdentityByEmail = findIdentityByEmail as jest.Mock;

const router = supertest(app);

describe("GET" + CHECK_YOUR_ANSWERS, () => {
    it("should return status 200", async () => {
        const res = await router.get(BASE_URL + CHECK_YOUR_ANSWERS);
        expect(res.status).toBe(200);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.text).toContain("Check your answers before sending your application");
    });
});

describe("POST " + CHECK_YOUR_ANSWERS, () => {
    it("should return status 302 after redirect", async () => {
        await mockSendVerifiedClientDetails.mockResolvedValueOnce(undefined);
        await mockFindIdentityByEmail.mockResolvedValueOnce(undefined);
        const res = await router.post(BASE_URL + CHECK_YOUR_ANSWERS).send({
            address: "Flat 1 Baker Street<br>Second Floor<br>London<br>Greater London<br>United Kingdom<br>NW1 6XE",
            dateOfBirth: "07 July 1998",
            whenIdentityChecksCompleted: "07 July 2024",
            documentsChecked: "• Biometric or machine readable passport<br>• Irish passport card",
            checkYourAnswerDeclaration: "confirm"
        });
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(BASE_URL + CONFIRMATION + "?lang=en");
    });

    it("should return status 302 after redirect to email kickout screen if email has already been verified", async () => {
        await mockSendVerifiedClientDetails.mockResolvedValueOnce(undefined);
        await mockFindIdentityByEmail.mockResolvedValueOnce(dummyIdentity);
        const res = await router.post(BASE_URL + CHECK_YOUR_ANSWERS).send({
            address: "Flat 1 Baker Street<br>Second Floor<br>London<br>Greater London<br>United Kingdom<br>NW1 6XE",
            dateOfBirth: "07 July 1998",
            whenIdentityChecksCompleted: "07 July 2024",
            documentsChecked: "• Biometric or machine readable passport<br>• Irish passport card",
            checkYourAnswerDeclaration: "confirm"
        });
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(BASE_URL + PROVIDE_DIFFERENT_EMAIL + "?lang=en");
    });

    it("should return status 400 if checkbox is not selected", async () => {
        const res = await router.post(BASE_URL + CHECK_YOUR_ANSWERS).send({ checkYourAnswerDeclaration: "" });
        expect(res.status).toBe(400);
        expect(res.text).toContain("Select to confirm the declaration");
    });

    it("should return status 500 if verification api errors", async () => {
        await mockFindIdentityByEmail.mockRejectedValueOnce(undefined);
        const res = await router.post(BASE_URL + CHECK_YOUR_ANSWERS).send({ checkYourAnswerDeclaration: "confirm" });
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});
