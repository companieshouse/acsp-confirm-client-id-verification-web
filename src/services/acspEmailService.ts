import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { createPublicApiKeyClient } from "./apiService";
import logger from "../utils/logger";
import { HttpResponse } from "@companieshouse/api-sdk-node/dist/http";
import { ClientVerificationEmail } from "@companieshouse/api-sdk-node/dist/services/acsp/types";

export const sendIdentityVerificationConfirmationEmail = async (emailData: ClientVerificationEmail): Promise<HttpResponse> => {
    logger.info(`Sending email to ACSP for client verification submission ID: ${emailData.referenceNumber}`);
    const apiClient: ApiClient = createPublicApiKeyClient();
    const sdkResponse: HttpResponse = await apiClient.acsp.sendIdentityVerificationEmail(emailData);

    if (!sdkResponse) {
        logger.error(`Client verification email returned no response for submission ID: ${emailData.referenceNumber}`);
        return Promise.reject(sdkResponse);
    }
    if (!sdkResponse.status || sdkResponse.status >= 400) {
        logger.error(`Http status code ${sdkResponse.status} - Client verification email Failed for submission ID: ${emailData.referenceNumber}`);
        return Promise.reject(sdkResponse);
    }
    logger.info(`Client verification email for submission ID: ${emailData.referenceNumber} has been sent`);
    return Promise.resolve(sdkResponse);
};
