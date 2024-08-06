import { createPrivateApiClient } from "private-api-sdk-node";
import PrivateApiClient from "private-api-sdk-node/dist/client";
import { createPrivateApiKeyClient, createPublicApiKeyClient } from "../../../src/services/apiService";
import { IHttpClient } from "@companieshouse/api-sdk-node";
jest.mock("private-api-sdk-node");

describe("API Service tests", () => {
    it("should return a new API Client, to use api key for authentication", () => {
        const apiClientResponse = createPublicApiKeyClient();
        expect(apiClientResponse).not.toBeNull();
    });

    it("should return private API client", () => {
        const privateApiClient: PrivateApiClient = new PrivateApiClient({} as IHttpClient, {} as IHttpClient);
        (createPrivateApiClient as jest.Mock).mockReturnValue(privateApiClient);
        expect(createPrivateApiKeyClient()).toBeInstanceOf(PrivateApiClient);
    });
});
