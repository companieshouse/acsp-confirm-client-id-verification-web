import { FormatService } from "../../../src/services/formatService";
import { DocumentDetails } from "../../../src/model/DocumentDetails";
import { Address } from "../../../src/model/Address";
import { getLocalesService } from "../../../src/utils/localise";
import { CRYPTOGRAPHIC_SECURITY_FEATURES } from "../../../src/utils/constants";

describe("FormatService tests", () => {
    describe("formatAddress", () => {
        it("should return an empty string if no address is provided", () => {
            const result = FormatService.formatAddress();
            expect(result).toBe("");
        });

        it("should format address correctly with all fields present", () => {
            const address: Address = {
                propertyDetails: "Flat 1",
                line1: "Baker Street",
                line2: "Second Floor",
                town: "London",
                county: "Greater London",
                country: "United Kingdom",
                postcode: "NW1 6XE"
            };
            const result = FormatService.formatAddress(address);
            const expected =
        "Flat 1 Baker Street<br>Second Floor<br>London<br>Greater London<br>United Kingdom<br>NW1 6XE";
            expect(result).toBe(expected);
        });

        it("should format address correctly with some fields missing", () => {
            const address: Address = {
                propertyDetails: "Flat 1",
                line1: "Baker Street",
                town: "London",
                postcode: "NW1 6XE"
            };
            const result = FormatService.formatAddress(address);
            const expected = "Flat 1 Baker Street<br>London<br>NW1 6XE";
            expect(result).toBe(expected);
        });

        it("should format address correctly with only one line", () => {
            const address: Address = {
                propertyDetails: "Flat 1",
                line1: "Baker Street"
            };
            const result = FormatService.formatAddress(address);
            const expected = "Flat 1 Baker Street";
            expect(result).toBe(expected);
        });

        it("should handle an address with long property details", () => {
            const address: Address = {
                propertyDetails: "1234567890 Elm Street, Suite 500",
                line1: "Baker Street",
                town: "London",
                postcode: "NW1 6XE"
            };
            const result = FormatService.formatAddress(address);
            const expected =
        "1234567890 Elm Street, Suite 500 Baker Street<br>London<br>NW1 6XE";
            expect(result).toBe(expected);
        });

        it("should format address correctly with only propertyDetails and no line1", () => {
            const address: Address = {
                propertyDetails: "Flat 1"
            };
            const result = FormatService.formatAddress(address);
            const expected = "Flat 1";
            expect(result).toBe(expected);
        });

        it("should format address correctly with only line1 and no propertyDetails", () => {
            const address: Address = {
                line1: "Baker Street"
            };
            const result = FormatService.formatAddress(address);
            const expected = "Baker Street";
            expect(result).toBe(expected);
        });

        it("should format address correctly with propertyDetails and line1, but no other fields", () => {
            const address: Address = {
                propertyDetails: "Flat 1",
                line1: "Baker Street"
            };
            const result = FormatService.formatAddress(address);
            const expected = "Flat 1 Baker Street";
            expect(result).toBe(expected);
        });
    });

    describe("formatDate", () => {
        it("should return an empty string if no date is provided", () => {
            const result = FormatService.formatDate();
            expect(result).toBe("");
        });

        it("should throw an error if an invalid date is provided", () => {
            const invalidDate = new Date("invalid-date-string");
            expect(() => FormatService.formatDate(invalidDate)).toThrow(
                "Invalid date"
            );
        });

        it("should format the date correctly", () => {
            const date = new Date("2024-08-02");
            const result = FormatService.formatDate(date);
            expect(result).toBe("02 August 2024");
        });

        it("should handle a date in the future", () => {
            const futureDate = new Date("2099-12-31");
            const result = FormatService.formatDate(futureDate);
            expect(result).toBe("31 December 2099");
        });

        it("should handle a date in the past", () => {
            const pastDate = new Date("1900-01-01");
            const result = FormatService.formatDate(pastDate);
            expect(result).toBe("01 January 1900");
        });
    });

    describe("formatDocumentsChecked", () => {
        const locales = getLocalesService();
        it("should return an empty string if no documents are provided", () => {
            const locales = getLocalesService();
            const result = FormatService.formatDocumentsChecked(undefined, locales.i18nCh.resolveNamespacesKeys("en"));
            expect(result).toBe("");
        });

        it("should return formatted documents in English", () => {
            const documents = ["biometric_passport", "irish_passport_card"];
            const result = FormatService.formatDocumentsChecked(documents, locales.i18nCh.resolveNamespacesKeys("en"));
            const expected =
        "• Biometric or machine readable passport<br>• Irish passport card";
            expect(result).toBe(expected);
        });

        it("should return formatted documents in Welsh", () => {
            const documents = ["biometric_passport", "irish_passport_card"];
            const result = FormatService.formatDocumentsChecked(documents, locales.i18nCh.resolveNamespacesKeys("cy"));
            const expected =
        "• Pasbort biometrig neu ddarllenadwy gan beiriant<br>• Cerdyn pasbort Gwyddelig";
            expect(result).toBe(expected);
        });

        it("should handle unknown document keys gracefully", () => {
            const documents = ["unknownDoc"];
            const result = FormatService.formatDocumentsChecked(documents, "en");
            expect(result).toBe("• unknownDoc");
        });

        it("should handle an empty documents array", () => {
            const documents: string[] = [];
            const result = FormatService.formatDocumentsChecked(documents, "en");
            expect(result).toBe("");
        });

        it("should handle a single document in the array", () => {
            const documents = ["biometric_passport"];
            const result = FormatService.formatDocumentsChecked(documents, locales.i18nCh.resolveNamespacesKeys("en"));
            const expected = "• Biometric or machine readable passport";
            expect(result).toBe(expected);
        });

        it("should handle multiple documents with different languages", () => {
            const documents = ["UK_or_EU_driving_licence", "EEA_identity_card"];
            const resultEn = FormatService.formatDocumentsChecked(documents, locales.i18nCh.resolveNamespacesKeys("en"));
            const resultWelsh = FormatService.formatDocumentsChecked(documents, locales.i18nCh.resolveNamespacesKeys("cy"));
            const expectedEn =
        "• UK, Channel Islands, Isle of Man and EU photocard driving licence (full or provisional)<br>• Identity card with biometric information from the EU, Norway, Iceland or Liechtenstein";
            const expectedWelsh =
        "• Trwydded yrru cerdyn-llun (llawn neu dros dro) y DU, Ynysoedd y Sianel, Ynys Manaw a'r UE<br>• Cerdyn adnabod gyda gwybodaeth fiometrig o'r UE, Norwy, Gwlad yr Iâ neu Liechtenstein";
            expect(resultWelsh).toBe(expectedWelsh);
            expect(resultEn).toBe(expectedEn);
        });
    });

    describe("formatDocumentsCheckedText", () => {
        const locales = getLocalesService();

        it("should return string array for the selected documents in English", () => {
            const documents = ["biometric_passport", "irish_passport_card"];
            const howIdentityDocsChecked = CRYPTOGRAPHIC_SECURITY_FEATURES;
            const result = FormatService.formatDocumentsCheckedText(documents, howIdentityDocsChecked, locales.i18nCh.resolveNamespacesKeys("en"));
            const expected = ["Biometric or machine readable passport", "Irish passport card"];
            expect(result[0]).toBe(expected[0]);
            expect(result[1]).toBe(expected[1]);
        });

        it("should return string array for the selected documents in Welsh", () => {
            const documents = ["biometric_passport", "irish_passport_card"];
            const howIdentityDocsChecked = CRYPTOGRAPHIC_SECURITY_FEATURES;
            const result = FormatService.formatDocumentsCheckedText(documents, howIdentityDocsChecked, locales.i18nCh.resolveNamespacesKeys("cy"));
            const expected = ["Pasbort biometrig neu ddarllenadwy gan beiriant", "Cerdyn pasbort Gwyddelig"];
            expect(result[0]).toBe(expected[0]);
            expect(result[1]).toBe(expected[1]);
        });

        it("should return string array which does not include option2 groupB documents", () => {
            const documents = ["UK_biometric_residence_permit", "UK_biometric_residence_card", "marriage_certificate"];
            const howIdentityDocsChecked = "";
            const result = FormatService.formatDocumentsCheckedText(documents, howIdentityDocsChecked, locales.i18nCh.resolveNamespacesKeys("en"));
            const expected = ["UK biometric residence permit (BRP)", "UK biometric residence card (BRC)"];
            expect(result[0]).toBe(expected[0]);
            expect(result[1]).toBe(expected[1]);
        });

        it("should return empty array for no documents", () => {
            const documents: string[] = [];
            const howIdentityDocsChecked = "";
            const result = FormatService.formatDocumentsCheckedText(documents, howIdentityDocsChecked, locales.i18nCh.resolveNamespacesKeys("en"));
            expect(result.length).toBe(0);
        });
    });
});
