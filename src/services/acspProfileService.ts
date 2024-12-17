import PrivateApiClient from "private-api-sdk-node/dist/client";
import { createLocalApiKeyClient } from "./apiService";
import logger from "../utils/logger";
import { Resource } from "@companieshouse/api-sdk-node";
import { AcspFullProfile } from "private-api-sdk-node/dist/services/acsp-profile/types";
import { AMLSupervioryBodies } from "../model/AMLSupervioryBodies";

export const getAcspFullProfile = async (acspNumber: string):Promise<AcspFullProfile> => {
    const apiClient: PrivateApiClient = createLocalApiKeyClient();

    logger.debug(`Recieved request to get acsp full profile for acsp number: ${acspNumber}`);

    const sdkResponse = await apiClient.acspProfileService.getAcspFullProfile(acspNumber);

    if (!sdkResponse) {
        logger.error(`Get acsp full profile returned no response for acsp number ${acspNumber}`);
        return Promise.reject(sdkResponse);
    }

    if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode >= 400) {
        logger.error(`Http status code ${sdkResponse.httpStatusCode} and error ${JSON.stringify(sdkResponse)} - Failed to get acsp full profile for acsp number ${acspNumber}`);
        return Promise.reject(sdkResponse);
    }

    const castedSdkResponse: Resource<AcspFullProfile> = sdkResponse as Resource<AcspFullProfile>;
    if (castedSdkResponse.resource === undefined) {
        logger.error(`Get acsp full profile returned no resource for acsp number ${acspNumber}`);
        return Promise.reject(sdkResponse);
    }

    return Promise.resolve(castedSdkResponse.resource);
};

export const getAmlBodiesAsString = (acspDetails: AcspFullProfile): string => {
    return acspDetails.amlDetails.map(details => {
        const body = details.supervisoryBody as keyof typeof AMLSupervioryBodies;
        return AMLSupervioryBodies[body];
    }).join(", ");
};
