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
        lang: string
    ): string {
        if (!documents || documents.length === 0) {
            return "";
        }
        const documentMappingEn: { [key: string]: string } = {
            biometricPassport: "Biometric or machine readable passport",
            irishPassport: "Irish passport card",
            ukDriversLicence:
        "UK, Channel Islands, Isle of Man and EU photocard driving licence (full or provisional)",
            identityCard:
        "Identity card with biometric information from the EU, Norway, Iceland or Liechtenstein",
            biometricPermit: "UK biometric residence permit (BRP)",
            biometricCard: "UK biometric residence card (BRC)",
            frontierPermit: "UK Frontier Worker permit",
            passportIrishCard: "Passport or Irish passport card",
            ukBRP: "UK biometric residence permit (BRP)",
            ukBRC: "UK biometric residence card (BRC)",
            passCard: "UK accredited PASS card",
            ukEuDigitalCard: "UK or EU driver digital tachograph card",
            fullDrivingLicense:
        "UK, Channel Islands, Isle of Man and EU photocard driving licence (full or provisional)",
            ukForceCard: "UK HM Forces ID Card",
            ukArmedForceCard: "UK HM Armed Forces Veteran Card",
            ukFrontierPermit: "UK Frontier Worker permit",
            photoWorkPermit: "Photographic work permit (government issued)",
            photoimmigrationDoc: "Photographic immigration document",
            photoVisa: "Photographic Visa",
            ukFirearmsLicence: "UK, Channel Islands and Isle of Man Firearms Licence",
            photoIdPrado: "Photographic ID listed on PRADO",
            photoIdPradoHint:
        "Such as a National Identity Card (Pakistan), crew member certificate (South Africa), or Permanent Resident Card (USA).",
            birthCert: "Birth or adoption certificate",
            marriageCert: "Marriage or civil partnership certificate",
            noPhotoimmigrationDoc: "Non-photographic immigration document",
            noPhotoVisa: "Non-photographic visa",
            noPhotoWorkPermit: "Non-photographic work permit",
            bankStatement: "Bank or building society statement",
            rentalAgreement:
        "UK local authority or social housing rental agreement (for the person’s current address)",
            morgageStatement: "Mortgage statement (for the person’s current address)",
            taxStatement:
        "UK council tax statement (for the person’s current address",
            utilityBill: "Utility bill (for the person’s current address)"
        };

        const documentMappingWelsh: { [key: string]: string } = {
            biometricPassport: "Biometric or machine readable passport Welsh",
            irishPassport: "Irish passport card Welsh",
            ukDriversLicence:
        "UK, Channel Islands, Isle of Man and EU photocard driving licence (full or provisional) Welsh",
            identityCard:
        "Identity card with biometric information from the EU, Norway, Iceland or Liechtenstein Welsh",
            biometricPermit: "UK biometric residence permit (BRP) Welsh",
            biometricCard: "UK biometric residence card (BRC) Welsh",
            frontierPermit: "UK Frontier Worker permit Welsh",
            passportIrishCard: "Passport or Irish passport card welsh",
            ukBRP: "UK biometric residence permit (BRP) welsh",
            ukBRC: "UK biometric residence card (BRC) welsh",
            passCard: "UK accredited PASS card welsh",
            ukEuDigitalCard: "UK or EU driver digital tachograph card welsh",
            fullDrivingLicense:
        "UK, Channel Islands, Isle of Man and EU photocard driving licence (full or provisional) welsh",
            ukForceCard: "UK HM Forces ID Card welsh",
            ukArmedForceCard: "UK HM Armed Forces Veteran Card welsh",
            ukFrontierPermit: "UK Frontier Worker permit welsh",
            photoWorkPermit: "Photographic work permit (government issued) welsh",
            photoimmigrationDoc: "Photographic immigration document welsh",
            photoVisa: "Photographic Visa welsh",
            ukFirearmsLicence:
        "UK, Channel Islands and Isle of Man Firearms Licence welsh",
            photoIdPrado: "Photographic ID listed on PRADO welsh",
            photoIdPradoHint:
        "Such as a National Identity Card (Pakistan), crew member certificate (South Africa), or Permanent Resident Card (USA). welsh",
            birthCert: "Birth or adoption certificate welsh",
            marriageCert: "Marriage or civil partnership certificate welsh",
            noPhotoimmigrationDoc: "Non-photographic immigration document welsh",
            noPhotoVisa: "Non-photographic visa welsh",
            noPhotoWorkPermit: "Non-photographic work permit welsh",
            bankStatement: "Bank or building society statement welsh",
            rentalAgreement:
        "UK local authority or social housing rental agreement (for the person’s current address) welsh",
            morgageStatement:
        "Mortgage statement (for the person’s current address) welsh",
            taxStatement:
        "UK council tax statement (for the person’s current address welsh",
            utilityBill: "Utility bill (for the person’s current address) welsh"
        };

        const documentMapping =
      lang === "en" ? documentMappingEn : documentMappingWelsh;

        const formattedDocuments = documents.map((doc) => {
            const docText = documentMapping[doc] || doc;
            return `• ${docText}`;
        });

        return formattedDocuments.join("<br>");
    }
}
