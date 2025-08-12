import { CRYPTOGRAPHIC_SECURITY_FEATURES } from "../utils/constants";
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
                combinedLine += this.escapeHtml(address.propertyDetails);
            }
            if (address.line1) {
                combinedLine += (combinedLine ? " " : "") + this.escapeHtml(address.line1);
            }
            parts.push(combinedLine);
        }

        if (address.line2) {
            parts.push(this.escapeHtml(address.line2));
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
        i18n: any

    ): string {
        if (!documents || documents.length === 0) {
            return "";
        }
        const documentMapping: { [key: string]: string } = {
            biometric_passport: i18n.biometric_passport,
            irish_passport_card: i18n.irish_passport_card,
            UK_or_EU_driving_licence: i18n.UK_or_EU_driving_licence,
            EEA_identity_card: i18n.EEA_identity_card,
            UK_biometric_residence_permit: i18n.UK_biometric_residence_permit,
            UK_biometric_residence_card: i18n.UK_biometric_residence_card,
            UK_frontier_worker_permit: i18n.UK_frontier_worker_permit,

            passport: i18n.passport,
            UK_PASS_card: i18n.UK_PASS_card,
            UK_or_EU_digital_tachograph_card: i18n.UK_or_EU_digital_tachograph_card,
            UK_HM_forces_card: i18n.UK_HM_forces_card,
            UK_HM_veteran_card: i18n.UK_HM_veteran_card,
            work_permit_photo_id: i18n.work_permit_photo_id,
            immigration_document_photo_id: i18n.immigration_document_photo_id,
            visa_photo_id: i18n.visa_photo_id,
            UK_firearms_licence: i18n.UK_firearms_licence,
            PRADO_supported_photo_id: i18n.PRADO_supported_photo_id,
            birth_certificate: i18n.birth_certificate,
            marriage_certificate: i18n.marriage_certificate,
            immigration_document_non_photo_id: i18n.immigration_document_non_photo_id,
            visa_non_photo_id: i18n.visa_non_photo_id,
            work_permit_non_photo_id: i18n.work_permit_non_photo_id,
            bank_statement: i18n.bank_statement,
            rental_agreement: i18n.rental_agreement,
            mortgage_statement: i18n.mortgage_statement,
            UK_council_tax_statement: i18n.UK_council_tax_statement,
            utility_bill: i18n.utility_bill
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
        let documentMapping:{ [key: string]: string };
        if (howIdentityDocsChecked === CRYPTOGRAPHIC_SECURITY_FEATURES) {
            // option1
            documentMapping = {
                biometric_passport: i18n.biometric_passport,
                irish_passport_card: i18n.irish_passport_card,
                UK_or_EU_driving_licence: i18n.UK_or_EU_driving_licence,
                EEA_identity_card: i18n.EEA_identity_card,
                UK_biometric_residence_permit: i18n.UK_biometric_residence_permit,
                UK_biometric_residence_card: i18n.UK_biometric_residence_card,
                UK_frontier_worker_permit: i18n.UK_frontier_worker_permit
            };
        } else {
            // option2 groupA docs
            documentMapping = {
                passport: i18n.passport,
                irish_passport_card: i18n.irish_passport_card,
                EEA_identity_card: i18n.EEA_identity_card,
                UK_biometric_residence_permit: i18n.UK_biometric_residence_permit,
                UK_biometric_residence_card: i18n.UK_biometric_residence_card,
                UK_PASS_card: i18n.UK_PASS_card,
                UK_or_EU_digital_tachograph_card: i18n.UK_or_EU_digital_tachograph_card,
                UK_or_EU_driving_licence: i18n.UK_or_EU_driving_licence,
                UK_HM_forces_card: i18n.UK_HM_forces_card,
                UK_HM_veteran_card: i18n.UK_HM_veteran_card,
                UK_frontier_worker_permit: i18n.UK_frontier_worker_permit,
                work_permit_photo_id: i18n.work_permit_photo_id,
                immigration_document_photo_id: i18n.immigration_document_photo_id,
                visa_photo_id: i18n.visa_photo_id,
                UK_firearms_licence: i18n.UK_firearms_licence,
                PRADO_supported_photo_id: i18n.PRADO_supported_photo_id
            };
        }
        documents.forEach((doc) => {
            if (documentMapping[doc]) {
                formattedDocuments.push(documentMapping[doc]);
            }
        });
        return formattedDocuments;
    }

    public static escapeHtml (text?: string): string {
        if (!text) {
            return "";
        }
        return text
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    public static formatDocumentHintText (documents: string[] | undefined, howIdentityDocsChecked: string | undefined, i18n: any): string[] {
        const documentHintText: string[] = [];
        if (!documents || documents.length === 0) {
            return documentHintText;
        }
        let hintMapping:{ [key: string]: string };
        if (howIdentityDocsChecked === CRYPTOGRAPHIC_SECURITY_FEATURES) {
            // option1
            hintMapping = {
                biometric_passport: i18n.biometricPassportHint,
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
}
