import { Request } from "express";
import { Identity, VerificationType, VerifiedClientData } from "private-api-sdk-node/dist/services/identity-verification/types";
import logger from "../utils/logger";
import { Resource } from "@companieshouse/api-sdk-node";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { createPrivateApiKeyClient } from "./apiService";
import { ClientData } from "model/ClientData";
import { getLoggedInAcspNumber, getLoggedInUserId } from "../utils/session";
import { BIOMETRIC_PASSPORT, PASSPORT } from "../utils/constants";

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
    public prepareVerifiedClientData (clientData: ClientData, req: Request): VerifiedClientData {
        const acspNumber: string = getLoggedInAcspNumber(req.session);
        const acspUserId: string = getLoggedInUserId(req.session);
        const foreNames: string[] = [];
        foreNames.push(clientData.firstName!);
        if (clientData.middleName !== "") {
            foreNames.push(clientData.middleName!);
        }

        if (!clientData.preferredFirstName) {
            clientData.preferredFirstName = clientData.firstName;
            clientData.preferredMiddleName = clientData.middleName;
            clientData.preferredLastName = clientData.lastName;
        }

        const preferredForeNames: string[] = [];
        preferredForeNames.push(clientData.preferredFirstName!);
        if (clientData.preferredMiddleName !== "") {
            preferredForeNames.push(clientData.preferredMiddleName!);
        }

        const documentsChecked = clientData.documentsChecked!;
        const verificationEvidence = documentsChecked.map((document) => {
            // Map biometric_passport to passport to be accepted by Verification Api
            const documentType = document === BIOMETRIC_PASSPORT ? PASSPORT : document;
            return { type: documentType as unknown as VerificationType };
        });

        return {
            acspUserId: acspUserId,
            acspId: acspNumber,
            verificationEvidence: verificationEvidence,
            verificationSource: "acsp",
            email: clientData.emailAddress!,
            currentName: {
                forenames: foreNames,
                surname: clientData.lastName!,
                created: new Date()
            },
            preferredName: {
                forenames: preferredForeNames,
                surname: clientData.preferredLastName!,
                created: new Date()
            },
            verificationDate: new Date(clientData.whenIdentityChecksCompleted!),
            validationMethod: clientData.howIdentityDocsChecked!,
            dateOfBirth: new Date(clientData.dateOfBirth!),
            currentAddress: {
                addressLine1: clientData.address?.line1!,
                addressLine2: clientData.address?.line2,
                region: clientData.address?.county!,
                locality: clientData.address?.town!,
                country: clientData.address?.country!,
                postalCode: clientData.address?.postcode!,
                premises: clientData.address?.propertyDetails!,
                created: new Date()
            }
        };
    }
}
