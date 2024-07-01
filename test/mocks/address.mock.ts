import { Address } from "@companieshouse/api-sdk-node/dist/services/acsp";
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";

export const address1: Address = {
    propertyDetails: "1",
    line1: "Mock Street",
    line2: "Mock Line 2",
    town: "Mock Town",
    county: "Mock County",
    country: "Mock Country",
    postcode: "AB12CD"
};

export const address2: Address = {
    propertyDetails: "2",
    line1: "Mock Street",
    line2: "Mock Line 2",
    town: "Mock Town",
    county: "Mock County",
    country: "Mock Country",
    postcode: "AB12CD"
};

export const addressList: Array<Address> = [address1, address2];

export const ukAddress1: UKAddress = {
    postcode: "AB121CD",
    premise: "1",
    addressLine1: "Test Address",
    addressLine2: "Test Line 2",
    postTown: "Test Town",
    country: "GB-ENG"
};

const ukAddress2: UKAddress = {
    postcode: "AB121CD",
    premise: "2",
    addressLine1: "Test Address",
    postTown: "Test Town",
    country: "Test Country"
};

export const ukAddressList: Array<UKAddress> = [ukAddress1, ukAddress2];
