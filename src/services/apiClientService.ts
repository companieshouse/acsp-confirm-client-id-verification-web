import PrivateApiClient from "private-api-sdk-node/dist/client";
import { createPrivateApiClient } from "private-api-sdk-node";
import { CHS_INTERNAL_API_KEY, INTERNAL_API_URL } from "../utils/properties";

export const createPrivateApiKeyClient = (): PrivateApiClient => {
    return createPrivateApiClient(CHS_INTERNAL_API_KEY, undefined, INTERNAL_API_URL);
};
