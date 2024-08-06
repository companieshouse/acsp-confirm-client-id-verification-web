import { Identity } from "private-api-sdk-node/dist/services/identity-verification/types";

export const dummyIdentity: Identity = {
    id: "23456",
    created: new Date(),
    status: "valid",
    statusDate: new Date(),
    userId: "1234567",
    sub: "",
    verificationSource: "",
    acspId: "1234567890",
    email: "demo@ch.gov.uk",
    currentName: {
        forenames: ["DEMO"],
        surname: "USER",
        created: new Date()
    },
    previousNames: [],
    dateOfBirth: new Date(),
    currentAddress: {
        addressLine1: "Address 1",
        addressLine2: "Address 2",
        region: "Region",
        country: "Country",
        postalCode: "Postcode",
        premises: "Premise",
        locality: "locality",
        created: new Date()
    },
    previousAddresses: [],
    verificationEvidence: [],
    lastUpdated: new Date()
};
