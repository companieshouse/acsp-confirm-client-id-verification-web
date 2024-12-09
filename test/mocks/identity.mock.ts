import { Identity, VerifiedClientData } from "private-api-sdk-node/dist/services/identity-verification/types";

export const dummyIdentity: Identity = {
    id: "23456",
    created: new Date(),
    status: "valid",
    statusDate: new Date(),
    userId: "1234567",
    sub: "",
    verificationSource: "acsp",
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
    verificationEvidence: ["passport"],
    lastUpdated: new Date()
};

export const verifiedClientDetails: VerifiedClientData = {
    verificationSource: "acsp",
    acspId: "1234567890",
    email: "demo@ch.gov.uk",
    currentName: {
        forenames: ["DEMO"],
        surname: "USER",
        created: new Date()
    },
    useNameOnPublicRegister: "use_name_on_public_register_yes",
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
    verificationEvidence: [{ type: "passport" }],
    acspUserId: "",
    verificationDate: new Date(),
    validationMethod: ""
};

export const clientDetails = {
    firstName: "DEMO",
    middleName: "",
    lastName: "USER",
    dateOfBirth: new Date(),
    address: {
        propertyDetails: "Premise",
        line1: "Address 1",
        line2: "Address 2",
        town: "locality",
        county: "Region",
        country: "Country",
        postcode: "Postcode"
    },
    documentsChecked: ["passport"],
    emailAddress: "demo@ch.gov.uk",
    confirmEmailAddress: "demo@ch.gov.uk",
    howIdentityDocsChecked: "",
    whenIdentityChecksCompleted: new Date()
};
