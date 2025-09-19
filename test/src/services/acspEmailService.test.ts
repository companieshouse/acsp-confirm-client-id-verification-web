import { createPublicApiKeyClient } from "../../../src/services/apiService";
import { sendIdentityConfirmationEmail } from "../../../src/services/acspEmailService";

jest.mock("../../../src/services/apiService");
jest.mock("@companieshouse/api-sdk-node");

const mockCreatePublicApiKeyClient = createPublicApiKeyClient as jest.Mock;
const mockSendIdentityVerificationEmail = jest.fn();

mockCreatePublicApiKeyClient.mockReturnValue({
    acsp: {
        sendIdentityVerificationEmail: mockSendIdentityVerificationEmail
    }
});

const MOCK_EMAIL_DATA = {
    to: "toemail@address.com",
    referenceNumber: "123456",
    clientName: "Client Name",
    clientEmailAddress: "clientemail@address.com"
};

describe("acspEmailService test", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("Verification emails", () => {
        it("should return http status code 200 when verification email sends successfully", async () => {
            mockSendIdentityVerificationEmail.mockResolvedValueOnce({ status: 200 });
            await expect(sendIdentityConfirmationEmail(MOCK_EMAIL_DATA, "verification")).resolves.toEqual({ status: 200 });
            expect(mockSendIdentityVerificationEmail).toHaveBeenCalledWith(MOCK_EMAIL_DATA, { application_type: "verification" });
        });

        it("should use verification as default when no application type is provided", async () => {
            mockSendIdentityVerificationEmail.mockResolvedValueOnce({ status: 200 });
            await expect(sendIdentityConfirmationEmail(MOCK_EMAIL_DATA)).resolves.toEqual({ status: 200 });
            expect(mockSendIdentityVerificationEmail).toHaveBeenCalledWith(MOCK_EMAIL_DATA, { application_type: "verification" });
        });

        it("should reject the promise when verification email API returns undefined", async () => {
            mockSendIdentityVerificationEmail.mockResolvedValueOnce(undefined);
            await expect(sendIdentityConfirmationEmail(MOCK_EMAIL_DATA, "verification")).rejects.toEqual(undefined);
        });

        it("should reject the promise when verification email API returns a status code over 400", async () => {
            mockSendIdentityVerificationEmail.mockResolvedValueOnce({ status: 500 });
            await expect(sendIdentityConfirmationEmail(MOCK_EMAIL_DATA, "verification")).rejects.toEqual({ status: 500 });
        });

        it("should reject the promise when verification email API returns no status code", async () => {
            mockSendIdentityVerificationEmail.mockResolvedValueOnce({ body: "error body" });
            await expect(sendIdentityConfirmationEmail(MOCK_EMAIL_DATA, "verification")).rejects.toEqual({ body: "error body" });
        });
    });

    describe("Reverification emails", () => {
        it("should return http status code 200 when reverification email sends successfully", async () => {
            mockSendIdentityVerificationEmail.mockResolvedValueOnce({ status: 200 });
            await expect(sendIdentityConfirmationEmail(MOCK_EMAIL_DATA, "reverification")).resolves.toEqual({ status: 200 });
            expect(mockSendIdentityVerificationEmail).toHaveBeenCalledWith(MOCK_EMAIL_DATA, { application_type: "reverification" });
        });

        it("should reject the promise when reverification email API returns undefined", async () => {
            mockSendIdentityVerificationEmail.mockResolvedValueOnce(undefined);
            await expect(sendIdentityConfirmationEmail(MOCK_EMAIL_DATA, "reverification")).rejects.toEqual(undefined);
        });

        it("should reject the promise when reverification email API returns a status code over 400", async () => {
            mockSendIdentityVerificationEmail.mockResolvedValueOnce({ status: 500 });
            await expect(sendIdentityConfirmationEmail(MOCK_EMAIL_DATA, "reverification")).rejects.toEqual({ status: 500 });
        });

        it("should reject the promise when reverification email API returns no status code", async () => {
            mockSendIdentityVerificationEmail.mockResolvedValueOnce({ body: "error body" });
            await expect(sendIdentityConfirmationEmail(MOCK_EMAIL_DATA, "reverification")).rejects.toEqual({ body: "error body" });
        });
    });
});
