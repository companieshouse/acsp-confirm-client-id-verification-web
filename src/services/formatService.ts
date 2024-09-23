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
        i18n: any
    ): string {
        if (!documents || documents.length === 0) {
            return "";
        }
        const documentMapping: { [key: string]: string } = {
            biometricPassport: i18n.biometricPassport,
            irishPassport: i18n.irishPassport,
            ukDriversLicence: i18n.ukDriversLicence,
            identityCard: i18n.identityCard,
            biometricPermit: i18n.biometricPermit,
            biometricCard: i18n.biometricCard,
            frontierPermit: i18n.frontierPermit,
            passport: i18n.passport,
            IrishCard: i18n.IrishCard,
            ukBRP: i18n.ukBRP,
            ukBRC: i18n.ukBRC,
            passCard: i18n.passCard,
            ukEuDigitalCard: i18n.ukEuDigitalCard,
            fullDrivingLicense: i18n.fullDrivingLicense,
            ukForceCard: i18n.ukForceCard,
            ukArmedForceCard: i18n.ukArmedForceCard,
            ukFrontierPermit: i18n.ukFrontierPermit,
            photoWorkPermit: i18n.photoWorkPermit,
            photoimmigrationDoc: i18n.photoimmigrationDoc,
            photoVisa: i18n.photoVisa,
            ukFirearmsLicence: i18n.ukFirearmsLicence,
            photoIdPrado: i18n.photoIdPrado,
            photoIdPradoHint: i18n.photoIdPradoHint,
            birthCert: i18n.birthCert,
            marriageCert: i18n.marriageCert,
            noPhotoimmigrationDoc: i18n.noPhotoimmigrationDoc,
            noPhotoVisa: i18n.noPhotoVisa,
            noPhotoWorkPermit: i18n.noPhotoWorkPermit,
            bankStatement: i18n.bankStatement,
            rentalAgreement: i18n.rentalAgreement,
            morgageStatement: i18n.morgageStatement,
            taxStatement: i18n.taxStatement,
            utilityBill: i18n.utilityBill
        };

        const formattedDocuments = documents.map((doc) => {
            const docText = documentMapping[doc] || doc;
            return `• ${docText}`;
        });

        return formattedDocuments.join("<br>");
    }
}
