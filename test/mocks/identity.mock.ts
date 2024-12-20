import { Identity, VerificationType, VerifiedClientData } from "private-api-sdk-node/dist/services/identity-verification/types";

export const dummyIdentity: Identity = {
    id: "23456",
    created: new Date().toDateString(),
    status: "valid",
    statusDate: new Date().toDateString(),
    userId: "1234567",
    sub: "",
    verificationSource: "acsp",
    acspId: "1234567890",
    email: "demo@ch.gov.uk",
    currentName: {
        forenames: ["DEMO"],
        surname: "USER",
        created: new Date().toDateString()
    },
    previousNames: [],
    dateOfBirth: new Date().toDateString(),
    currentAddress: {
        addressLine1: "Address 1",
        addressLine2: "Address 2",
        region: "Region",
        country: "Country",
        postalCode: "Postcode",
        premises: "Premise",
        locality: "locality",
        created: new Date().toDateString()
    },
    previousAddresses: [],
    verificationEvidence: [{ type: VerificationType.passport }],
    lastUpdated: new Date().toDateString(),
    preferredName: {
        forenames: ["DEMO"],
        surname: "USER",
        created: new Date().toDateString()
    },
    assuranceLevel: "medium",
    secureIndicator: false
};

export const verifiedClientDetails: VerifiedClientData = {
    verificationSource: "acsp",
    acspId: "1234567890",
    email: "demo@ch.gov.uk",
    currentName: {
        forenames: ["DEMO", "1"],
        surname: "USER",
        created: new Date().toDateString()
    },
    preferredName: {
        forenames: ["DEMO", "1"],
        surname: "USER",
        created: new Date().toDateString()
    },
    dateOfBirth: new Date(),
    currentAddress: {
        addressLine1: "Address 1",
        addressLine2: "Address 2",
        region: "Region",
        country: "Country",
        postalCode: "Postcode",
        premises: "Premise",
        locality: "locality",
        created: new Date().toDateString()
    },
    verificationEvidence: [{ type: VerificationType.passport }],
    acspUserId: "",
    verificationDate: new Date(),
    validationMethod: ""
};

export const clientDetails = {
    firstName: "DEMO",
    middleName: "1",
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
