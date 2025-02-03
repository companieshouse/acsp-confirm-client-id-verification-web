import { createPublicApiKeyClient } from "../../../src/services/apiService";
import { sendIdentityVerificationConfirmationEmail } from "../../../src/services/acspEmailService";

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
    it("should return http status code 200 when email sends successfully", async () => {
        mockSendIdentityVerificationEmail.mockResolvedValueOnce({ status: 200 });
        await expect(sendIdentityVerificationConfirmationEmail(MOCK_EMAIL_DATA)).resolves.toEqual({ status: 200 });
    });

    it("Should reject the promise when acsp-api returns undefined", async () => {
        mockSendIdentityVerificationEmail.mockResolvedValueOnce(undefined);
        await expect(sendIdentityVerificationConfirmationEmail(MOCK_EMAIL_DATA)).rejects.toEqual(undefined);
    });

    it("Should reject the promise when acsp-api returns a status code over 400", async () => {
        mockSendIdentityVerificationEmail.mockResolvedValueOnce({ status: 500 });
        await expect(sendIdentityVerificationConfirmationEmail(MOCK_EMAIL_DATA)).rejects.toEqual({ status: 500 });
    });
    it("Should reject the promise when acsp-api returns no status code", async () => {
        mockSendIdentityVerificationEmail.mockResolvedValueOnce({ body: "error body" });
        await expect(sendIdentityVerificationConfirmationEmail(MOCK_EMAIL_DATA)).rejects.toEqual({ body: "error body" });
    });
});
