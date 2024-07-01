import { Session } from "@companieshouse/node-session-handler";
import { createPaymentApiClient, createPublicApiKeyClient, createPublicApiKeyClientWithToken, createPublicOAuthApiClient } from "../../../src/services/apiService";
import { getSessionRequestWithPermission } from "../../mocks/session.mock";

const session = getSessionRequestWithPermission();
const nullSession = new Session();

describe("API Service tests", () => {

    it("should return a new API Client, to use api key for authentication", () => {
        const apiClientResponse = createPublicOAuthApiClient(session);
        expect(apiClientResponse).not.toBeNull();
    });

    it("should throw an error if session is null", () => {
        expect(() => createPublicOAuthApiClient(nullSession))
            .toThrow(Error("Error getting session keys for creating public api client"));
    });

    it("should return a new API Client, to use api key for authentication", () => {
        const apiClientResponse = createPublicApiKeyClient();
        expect(apiClientResponse).not.toBeNull();
    });

    it("should return a new API Client with token", () => {
        const apiClientResponse = createPublicApiKeyClientWithToken("token");
        expect(apiClientResponse).not.toBeNull();
    });

    it("should return a new API Client, to use api key for authentication", () => {
        const apiClientResponse = createPaymentApiClient(session, "/payment");
        expect(apiClientResponse).not.toBeNull();
    });

    it("should throw an error if session is null", () => {
        expect(() => createPaymentApiClient(nullSession, "/payment"))
            .toThrow(Error("Error getting session keys for creating public api client"));
    });
});
