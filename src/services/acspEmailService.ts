import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { createPublicApiKeyClient } from "./apiService";
import logger from "../utils/logger";
import { HttpResponse } from "@companieshouse/api-sdk-node/dist/http";
import { ClientVerificationEmail } from "@companieshouse/api-sdk-node/dist/services/acsp/types";

/**
 * Sends an identity verification confirmation email to an ACSP for a client submission.
 * This function handles both initial verification and reverification email notifications,
 * routing to the appropriate email template based on the application type.
 *
 * @param emailData -       The client verification email data containing recipient details and reference number
 * @param applicationType - The type of application: "verification" for verification applications
 *                          or "reverification" for reverification applications.
 *                          Defaults to "verification" if application_type is not specified.
 * @returns Promise that resolves to HttpResponse on success or rejects on failure
 */
export const sendIdentityConfirmationEmail = async (emailData: ClientVerificationEmail, applicationType: "verification" | "reverification" = "verification"): Promise<HttpResponse> => {
    logger.info(`Sending email to ACSP for client ${applicationType} submission ID: ${emailData.referenceNumber}`);
    const apiClient: ApiClient = createPublicApiKeyClient();

    const sdkResponse: HttpResponse = await apiClient.acsp.sendIdentityVerificationEmail(emailData, { application_type: applicationType });

    if (!sdkResponse) {
        logger.error(`Client ${applicationType} email returned no response for submission ID: ${emailData.referenceNumber}`);
        return Promise.reject(sdkResponse);
    }
    if (!sdkResponse.status || sdkResponse.status >= 400) {
        logger.error(`Http status code ${sdkResponse.status} - Client ${applicationType} email Failed for submission ID: ${emailData.referenceNumber}`);
        return Promise.reject(sdkResponse);
    }
    logger.info(`Client ${applicationType} email for submission ID: ${emailData.referenceNumber} has been sent`);
    return Promise.resolve(sdkResponse);
};
