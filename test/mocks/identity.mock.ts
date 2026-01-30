import { Identity, VerificationType, VerifiedClientData } from "private-api-sdk-node/dist/services/identity-verification/types";

export const dummyIdentity: Identity = {
    id: "23456",
    created: new Date().toDateString(),
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
    verificationEvidence: [{ type: VerificationType.passport }],
    lastUpdated: new Date(),
    preferredName: {
        forenames: ["DEMO"],
        surname: "USER",
        created: new Date()
    },
    assuranceLevel: "medium",
    secureIndicator: false
};

export const dummyReverificationIdentity: Identity = {
    id: "23456",
    created: new Date().toDateString(),
    status: "valid_pending_reverification",
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
    verificationEvidence: [{ type: VerificationType.passport }],
    lastUpdated: new Date(),
    preferredName: {
        forenames: ["DEMO"],
        surname: "USER",
        created: new Date()
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
        created: new Date()
    },
    preferredName: {
        forenames: ["DEMO", "1"],
        surname: "USER",
        created: new Date()
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
        created: new Date()
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
    idDocumentDetails: [
        {
            docName: "passport",
            documentNumber: "123456789",
            expiryDate: new Date(),
            countryOfIssue: "Country",
            documentType: "passport"
        }
    ],
    emailAddress: "demo@ch.gov.uk",
    howIdentityDocsChecked: "",
    whenIdentityChecksCompleted: new Date()
};

export const clientDetailsBiometricPassport = {
    firstName: "John",
    middleName: "A",
    lastName: "Doe",
    dateOfBirth: new Date(),
    address: {
        line1: "123 Main St",
        line2: "Apt 4",
        county: "County",
        town: "Town",
        country: "Country",
        postcode: "12345",
        propertyDetails: "Property Details"
    },
    documentsChecked: ["biometric_passport"],
    idDocumentDetails: [
        {
            docName: "biometric_passport",
            documentNumber: "123456789",
            expiryDate: new Date(),
            countryOfIssue: "Country",
            documentType: "biometric_passport"
        }
    ],
    emailAddress: "john.doe@example.com",
    howIdentityDocsChecked: "",
    whenIdentityChecksCompleted: new Date("2028-02-25")
};
