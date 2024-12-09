import { Address } from "../model/Address";

export class FormatService {
    public static formatAddress (address?: Address): string {
        if (!address) {
            return "";
        }
        const parts: string[] = [];
        if (address.propertyDetails || address.line1) {
            let combinedLine = "";
            if (address.propertyDetails) {
                combinedLine += address.propertyDetails;
            }
            if (address.line1) {
                combinedLine += (combinedLine ? " " : "") + address.line1;
            }
            parts.push(combinedLine);
        }

        if (address.line2) {
            parts.push(address.line2);
        }

        if (address.town) {
            parts.push(address.town);
        }

        if (address.county) {
            parts.push(address.county);
        }

        if (address.country) {
            parts.push(address.country);
        }

        if (address.postcode) {
            parts.push(address.postcode);
        }

        // Join the parts with `<br>` and return the formatted address
        return parts.join("<br>");
    }

    public static formatDate (date?: Date): string {
        if (!date) {
            return "";
        }
        if (!(date instanceof Date) || isNaN(date.getTime())) {
            throw new Error("Invalid date");
        }
        const options: Intl.DateTimeFormatOptions = {
            day: "2-digit",
            month: "long",
            year: "numeric"
        };
        return new Intl.DateTimeFormat("en-GB", options).format(date);
    }

    public static formatDocumentsChecked (
        documents: string[] | undefined,
        howIdentityDocsChecked: string | undefined,
        i18n: any

    ): string {
        if (!documents || documents.length === 0) {
            return "";
        }
        const documentMapping = getDocumentMapping(documents, howIdentityDocsChecked, i18n, "confirmation");
        const formattedDocuments = documents.map((doc) => {
            const docText = documentMapping[doc] || doc;
            return `• ${docText}`;
        });

        return formattedDocuments.join("<br>");
    }

    public static formatDocsCheckedExcludingGroupBDocs (
        documents: string[] | undefined,
        howIdentityDocsChecked: string | undefined,
        i18n: any
    ): string[] {
        var formattedDocuments:string[] = [];
        if (!documents || documents.length === 0) {
            return formattedDocuments;
        }
        const documentMapping = getDocumentMapping(documents, howIdentityDocsChecked, i18n, "documentDetailsCapture");
        documents.forEach((doc) => {
            if (documentMapping[doc]) {
                formattedDocuments.push(documentMapping[doc]);
            }
        });
        return formattedDocuments;
    }

    public static groupBIdentityDocuments (documents: string[] | undefined, howIdentityDocsChecked: string | undefined, i18n: any) {
        const documentMapping = getDocumentMapping(documents, howIdentityDocsChecked, i18n, "checkYourAnswers");

        const formattedDocuments: string[] = [];
        if (!documents || documents.length === 0) {
            return formattedDocuments;
        }
        documents.forEach((doc) => {
            if (documentMapping[doc]) {
                formattedDocuments.push(`• ${documentMapping[doc]}`);
            }
        });

        return formattedDocuments.join("<br>");
    }
}

const getDocumentMapping = (documents: string[] | undefined, howIdentityDocsChecked: string | undefined, i18n: any, page: string): { [key: string]: string } => {
    let documentMapping:{ [key: string]: string } = {};
    if (howIdentityDocsChecked === "cryptographic_security_features_checked") {
        // option1 docs
        documentMapping = {
            passport: i18n.biometricPassport,
            irish_passport_card: i18n.irishPassport,
            UK_or_EU_driving_licence: i18n.ukDriversLicence,
            EEA_identity_card: i18n.identityCard,
            UK_biometric_residence_permit: i18n.biometricPermit,
            UK_biometric_residence_card: i18n.biometricCard,
            UK_frontier_worker_permit: i18n.frontierPermit
        };
    } else if (page === "documentDetailsCapture") {
        // option2 groupA docs
        documentMapping = {
            passport: i18n.passport,
            irish_passport_card: i18n.IrishCard,
            EEA_identity_card: i18n.identityCard,
            UK_biometric_residence_permit: i18n.ukBRP,
            UK_biometric_residence_card: i18n.ukBRC,
            UK_PASS_card: i18n.passCard,
            UK_or_EU_digital_tachograph_card: i18n.ukEuDigitalCard,
            UK_or_EU_driving_licence: i18n.fullDrivingLicense,
            UK_HM_forces_card: i18n.ukForceCard,
            UK_HM_veteran_card: i18n.ukArmedForceCard,
            UK_frontier_worker_permit: i18n.ukFrontierPermit,
            work_permit_photo_id: i18n.photoWorkPermit,
            immigration_document_photo_id: i18n.photoimmigrationDoc,
            visa_photo_id: i18n.photoVisa,
            UK_firearms_licence: i18n.ukFirearmsLicence,
            PRADO_supported_photo_id: i18n.photoIdPrado
        };
    } else if (page === "checkYourAnswers") {
        // option2 group B docs
        documentMapping = {
            birth_certificate: i18n.birthCert,
            marriage_certificate: i18n.marriageCert,
            immigration_document_non_photo_id: i18n.noPhotoimmigrationDoc,
            visa_non_photo_id: i18n.noPhotoVisa,
            work_permit_non_photo_id: i18n.noPhotoWorkPermit,
            bank_statement: i18n.bankStatement,
            rental_agreement: i18n.rentalAgreement,
            mortgage_statement: i18n.morgageStatement,
            UK_council_tax_statement: i18n.taxStatement,
            utility_bill: i18n.utilityBill
        };
    } else if (page === "confirmation") {
        // option2 groupAB docs
        documentMapping = {
            passport: i18n.passport,
            irish_passport_card: i18n.IrishCard,
            EEA_identity_card: i18n.identityCard,
            UK_biometric_residence_permit: i18n.ukBRP,
            UK_biometric_residence_card: i18n.ukBRC,
            UK_PASS_card: i18n.passCard,
            UK_or_EU_digital_tachograph_card: i18n.ukEuDigitalCard,
            UK_or_EU_driving_licence: i18n.fullDrivingLicense,
            UK_HM_forces_card: i18n.ukForceCard,
            UK_HM_veteran_card: i18n.ukArmedForceCard,
            UK_frontier_worker_permit: i18n.ukFrontierPermit,
            work_permit_photo_id: i18n.photoWorkPermit,
            immigration_document_photo_id: i18n.photoimmigrationDoc,
            visa_photo_id: i18n.photoVisa,
            UK_firearms_licence: i18n.ukFirearmsLicence,
            PRADO_supported_photo_id: i18n.photoIdPrado,
            birth_certificate: i18n.birthCert,
            marriage_certificate: i18n.marriageCert,
            immigration_document_non_photo_id: i18n.noPhotoimmigrationDoc,
            visa_non_photo_id: i18n.noPhotoVisa,
            work_permit_non_photo_id: i18n.noPhotoWorkPermit,
            bank_statement: i18n.bankStatement,
            rental_agreement: i18n.rentalAgreement,
            mortgage_statement: i18n.morgageStatement,
            UK_council_tax_statement: i18n.taxStatement,
            utility_bill: i18n.utilityBill
        };
    }
    return documentMapping;
};
