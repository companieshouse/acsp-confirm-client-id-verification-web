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

    public static formatDate (date?: Date, i18n?: any): string {
        if (!date) {
            return i18n ? i18n.dateNotProvided : "";
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
        i18n: any

    ): string {
        if (!documents || documents.length === 0) {
            return "";
        }
        const documentMapping: { [key: string]: string } = {
            passport: i18n.biometricPassport,
            irish_passport_card: i18n.irishPassport,
            UK_or_EU_driving_licence: i18n.ukDriversLicence,
            EEA_identity_card: i18n.identityCard,
            UK_biometric_residence_permit: i18n.biometricPermit,
            UK_biometric_residence_card: i18n.biometricCard,
            UK_frontier_worker_permit: i18n.frontierPermit,

            UK_PASS_card: i18n.passCard,
            UK_or_EU_digital_tachograph_card: i18n.ukEuDigitalCard,
            UK_HM_forces_card: i18n.ukForceCard,
            UK_HM_veteran_card: i18n.ukArmedForceCard,
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

        const formattedDocuments = documents.map((doc) => {
            const docText = documentMapping[doc] || doc;
            return `• ${docText}`;
        });

        return formattedDocuments.join("<br>");
    }

    public static formatDocumentsCheckedText (
        documents: string[] | undefined,
        howIdentityDocsChecked: string | undefined,
        i18n: any
    ): string[] {
        var formattedDocuments:string[] = [];
        if (!documents || documents.length === 0) {
            return formattedDocuments;
        }
        const documentMapping = FormatService.getDocumentMapping(howIdentityDocsChecked, i18n);

        documents.forEach((doc) => {
            if (documentMapping[doc]) {
                formattedDocuments.push(documentMapping[doc]);
            }
        });
        return formattedDocuments;
    }

    public static formatDocumentHintText (documents: string[] | undefined, howIdentityDocsChecked: string | undefined, i18n: any): string[] {
        const documentHintText: string[] = [];
        if (!documents || documents.length === 0) {
            return documentHintText;
        }
        let hintMapping:{ [key: string]: string };
        if (howIdentityDocsChecked === "cryptographic_security_features_checked") {
            // option1
            hintMapping = {
                passport: i18n.biometricPassportHint,
                irish_passport_card: i18n.irishPassportHint,
                UK_or_EU_driving_licence: i18n.ukDriversLicenceHint,
                EEA_identity_card: i18n.identityCardHint,
                UK_biometric_residence_permit: i18n.biometricPermitHint,
                UK_biometric_residence_card: i18n.biometricCardHint,
                UK_frontier_worker_permit: i18n.frontierPermitHint
            };
        } else {
            hintMapping = {
                passport: i18n.biometricPassportHint,
                irish_passport_card: i18n.irishPassportHint,
                EEA_identity_card: i18n.identityCardHint,
                UK_biometric_residence_permit: i18n.biometricPermitHint,
                UK_biometric_residence_card: i18n.biometricCardHint,
                UK_PASS_card: i18n.passCardHint,
                UK_or_EU_digital_tachograph_card: i18n.ukEuDigitalCardHint,
                UK_or_EU_driving_licence: i18n.ukDriversLicenceHint,
                UK_HM_forces_card: i18n.ukForceCardHint,
                UK_HM_veteran_card: i18n.ukArmedForceCardHint,
                UK_frontier_worker_permit: i18n.frontierPermitHint,
                work_permit_photo_id: i18n.photoWorkPermitHint,
                immigration_document_photo_id: i18n.photoimmigrationDocHint,
                visa_photo_id: i18n.photoVisaHint,
                UK_firearms_licence: i18n.ukFirearmsLicenceHint,
                PRADO_supported_photo_id: i18n.photoIdPradoDetailsHint
            };
        }
        documents.forEach((doc) => {
            if (hintMapping[doc]) {
                documentHintText.push(hintMapping[doc]);
            }
        });
        return documentHintText;
    }

    public static findDocumentName (
        document: string | undefined,
        i18n: any,
        howIdentityDocsChecked: string | undefined
    ): string {
        if (!document || document.length === 0) {
            return "";
        }
        const documentMapping = FormatService.getDocumentMapping(howIdentityDocsChecked, i18n);
        return documentMapping[document] || "";
    }

    private static getDocumentMapping (howIdentityDocsChecked: string | undefined, i18n: any): { [key: string]: string } {
        if (howIdentityDocsChecked === "cryptographic_security_features_checked") {
            return {
                passport: i18n.biometricPassport,
                irish_passport_card: i18n.irishPassport,
                UK_or_EU_driving_licence: i18n.ukDriversLicence,
                EEA_identity_card: i18n.identityCard,
                UK_biometric_residence_permit: i18n.biometricPermit,
                UK_biometric_residence_card: i18n.biometricCard,
                UK_frontier_worker_permit: i18n.frontierPermit
            };
        } else {
            return {
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
        }
    }
}
