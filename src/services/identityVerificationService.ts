import { Identity, VerifiedClientData } from "private-api-sdk-node/dist/services/identity-verification/types";
import logger from "../lib/Logger";
import { Resource } from "@companieshouse/api-sdk-node";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { createPrivateApiKeyClient } from "./apiService";
import { ClientData } from "model/ClientData";

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

export const sendVerifiedClientDetails = async (verifiedClientData: VerifiedClientData): Promise<Identity | undefined> => {
    const createUvidType = "acsp";
    const apiClient = createPrivateApiKeyClient();

    logger.debug(`Recieved Request to send verified client details ${verifiedClientData}`);

    const sdkResponse: Resource<Identity> | ApiErrorResponse = await apiClient.identityVerificationService.sendVerifiedClientDetails(verifiedClientData, createUvidType);

    if (!sdkResponse) {
        logger.error(`send verified client data returned no response ${verifiedClientData}`);
        return Promise.reject(sdkResponse);
    }
    if (!sdkResponse.httpStatusCode || (sdkResponse.httpStatusCode >= 400 && sdkResponse.httpStatusCode !== 404)) {
        logger.error(`Http status code ${sdkResponse.httpStatusCode} and error ${JSON.stringify(sdkResponse)} - Failed to get identity for ${verifiedClientData}`);
        return Promise.reject(sdkResponse);
    }

    if (sdkResponse.httpStatusCode === 404) {
        logger.debug(`send verified client data returned status 404 ${verifiedClientData}`);
        return Promise.resolve(undefined);
    }

    const castedSdkResponse: Resource<Identity> = sdkResponse as Resource<Identity>;
    if (castedSdkResponse.resource === undefined) {
        logger.error(`send verified client data returned no resource for ${verifiedClientData}`);
        return Promise.reject(sdkResponse);
    }

    logger.debug(`Identity details ${JSON.stringify(sdkResponse)}`);
    return Promise.resolve(castedSdkResponse.resource);
};

export class IdentityVerificationService {
    public prepareVerifiedClientData (clientData: ClientData) : VerifiedClientData {
        const foreNames = [];
        foreNames.push(clientData.firstName!);
        if (clientData.middleName !== "") {
            foreNames.push(clientData.middleName!);
        }

        return {
            // below 3 fields are hardcoded. Need to replace with actual logic in future
            acspId: "1234567890",
            verificationEvidence: ["passport"],
            acspUserId: "1234",

            verificationSource: "acsp",
            email: clientData.emailAddress!,
            currentName: {
                forenames: foreNames,
                surname: clientData.lastName!,
                created: new Date()
            },
            verificationDate: clientData.whenIdentityChecksCompleted!,
            validationMethod: clientData.howIdentityDocsChecked!,
            dateOfBirth: clientData.dateOfBirth!,
            currentAddress: {
                addressLine1: clientData.address?.line1!,
                addressLine2: clientData.address?.line2,
                region: clientData.address?.county,
                locality: clientData.address?.town,
                country: clientData.address?.country!,
                postalCode: clientData.address?.postcode!,
                premises: clientData.address?.propertyDetails!,
                created: new Date()
            }
        };
    }
}
