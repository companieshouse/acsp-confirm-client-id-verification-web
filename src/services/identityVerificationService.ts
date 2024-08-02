import { Identity } from "private-api-sdk-node/dist/services/identity-verification/types";
import logger from "../lib/Logger";
import { Resource } from "@companieshouse/api-sdk-node";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { createPrivateApiKeyClient } from "./apiClientService";

export const findIdentityByEmail = async (email: string): Promise<Identity | undefined> => {
    const apiClient = createPrivateApiKeyClient();

    logger.debug(`Recieved Request to find identity by email ${email}`);

    const sdkResponse: Resource<Identity> | ApiErrorResponse = await apiClient.identityVerificationService.findIdentityByEmail(email);

    if (!sdkResponse) {
        logger.error(`Find identity by email returned no response for email ${email}`);
        return Promise.reject(sdkResponse);
    }
    if (!sdkResponse.httpStatusCode || (sdkResponse.httpStatusCode >= 400 && sdkResponse.httpStatusCode !== 404)) {
        logger.error(`Http status code ${sdkResponse.httpStatusCode} and error ${JSON.stringify(sdkResponse)} - Failed to get identity for email ${email}`);
        return Promise.reject(sdkResponse);
    }

    if (sdkResponse.httpStatusCode === 404) {
        logger.debug(`Find identity by email returned status 404, no identity found with email ${email}`);
        return Promise.resolve(undefined);
    }

    const castedSdkResponse: Resource<Identity> = sdkResponse as Resource<Identity>;
    if (castedSdkResponse.resource === undefined) {
        logger.error(`Find identity by email returned no resource for email ${email}`);
        return Promise.reject(sdkResponse);
    }

    logger.debug(`Identity details ${JSON.stringify(sdkResponse)}`);
    return Promise.resolve(castedSdkResponse.resource);
};
