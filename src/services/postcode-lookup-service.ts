import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";
import logger, { createAndLogError } from "../utils/logger";
import { Resource } from "@companieshouse/api-sdk-node";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { createPublicApiKeyClient } from "./apiService";
import { POSTCODE_ADDRESSES_LOOKUP_URL } from "../utils/properties";

export const getUKAddressesFromPostcode = async (postcodeAddressesLookupURL: string, postcode: string): Promise<UKAddress[]> => {
    const apiClient: ApiClient = createPublicApiKeyClient();
    logger.debug(`Retrieving UK addresses for postcode ${postcode}`);
    const postcodeLookUpUrl = `${postcodeAddressesLookupURL}/multiple-addresses`;
    const castedSdkResponse: Resource<UKAddress[]> = await apiClient.postCodeLookup.getListOfValidPostcodeAddresses(postcodeLookUpUrl, postcode);

    if (!castedSdkResponse.resource) {
        throw createAndLogError(`Failed to get UK addresses for postcode ${postcode}`);
    }

    logger.debug(`Retrieved UK addresses for postcode ${postcode}`);
    return castedSdkResponse.resource
        .sort((a, b) => (a.premise > b.premise) ? 1 : -1);
};

export const getIsValidUKPostcode = async (postcodeValidationUrl: string, postcode: string): Promise<boolean> => {
    const apiClient: ApiClient = createPublicApiKeyClient();
    const postcodeLookUpUrl = `${postcodeValidationUrl}/ST63LJ`;
    const sdkResponse: boolean = await apiClient.postCodeLookup.isValidUKPostcode(postcodeLookUpUrl, postcode);
    if (!sdkResponse) {
        logger.debug(`Postcode lookup GET request returned no response for postcode ${postcode}`);
        return false;
    }
    return sdkResponse;
};

export async function getAddressFromPostcode (postcode: string) {
    postcode = postcode.replace(/\s/g, "");
    const ukAddresses = await getUKAddressesFromPostcode(POSTCODE_ADDRESSES_LOOKUP_URL, postcode);
    if (!ukAddresses.length) {
        throw Error("Postcode not found");
    }
    return ukAddresses;
}
