import { FormatService } from "../../../src/services/formatService";
import { Address } from "../../../src/model/Address";

describe("ConfirmFormatService tests", () => {

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
            const expected = "Flat 1 Baker Street<br>Second Floor<br>London<br>Greater London<br>United Kingdom<br>NW1 6XE";
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
            const expected = "1234567890 Elm Street, Suite 500 Baker Street<br>London<br>NW1 6XE";
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
            expect(() => FormatService.formatDate(invalidDate)).toThrow("Invalid date");
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
        it("should return an empty string if no documents are provided", () => {
            const result = FormatService.formatDocumentsChecked(undefined, "en");
            expect(result).toBe("");
        });

        it("should return formatted documents in English", () => {
            const documents = ["biometricPassport", "irishPassport"];
            const result = FormatService.formatDocumentsChecked(documents, "en");
            const expected = "• Biometric or machine readable passport<br>• Irish passport card";
            expect(result).toBe(expected);
        });

        it("should return formatted documents in Welsh", () => {
            const documents = ["biometricPassport", "irishPassport"];
            const result = FormatService.formatDocumentsChecked(documents, "cy");
            const expected = "• Biometric or machine readable passport Welsh<br>• Irish passport card Welsh";
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
            const documents = ["biometricPassport"];
            const result = FormatService.formatDocumentsChecked(documents, "en");
            const expected = "• Biometric or machine readable passport";
            expect(result).toBe(expected);
        });

        it("should handle multiple documents with different languages", () => {
            const documents = ["ukDriversLicence", "identityCard"];
            const resultEn = FormatService.formatDocumentsChecked(documents, "en");
            const resultWelsh = FormatService.formatDocumentsChecked(documents, "cy");
            const expectedEn = "• UK, Channel Islands, Isle of Man and EU photocard driving licence (full or provisional)<br>• Identity card with biometric information from the EU, Norway, Iceland or Liechtenstein";
            const expectedWelsh = "• UK, Channel Islands, Isle of Man and EU photocard driving licence (full or provisional) Welsh<br>• Identity card with biometric information from the EU, Norway, Iceland or Liechtenstein Welsh";
            expect(resultEn).toBe(expectedEn);
            expect(resultWelsh).toBe(expectedWelsh);
        });
    });

    describe("formatHowIdentityDocsChecked", () => {
        it("should return an empty string if no option is provided", () => {
            const result = FormatService.formatHowIdentityDocsChecked(undefined, "en");
            expect(result).toBe("");
        });

        it("should return the correct result for OPTION1 in English", () => {
            const result = FormatService.formatHowIdentityDocsChecked("OPTION1", "en");
            expect(result).toBe("Option 1 - The identity documents were checked using identity document validation technology (IDVT).");
        });

        it("should return the correct result for OPTION1 in Welsh", () => {
            const result = FormatService.formatHowIdentityDocsChecked("OPTION1", "cy");
            expect(result).toBe("Option 1 - The identity documents were checked using identity document validation technology (IDVT). Welsh");
        });

        it("should return the correct result for OPTION2 in English", () => {
            const result = FormatService.formatHowIdentityDocsChecked("OPTION2", "en");
            expect(result).toBe("Option 2 - The identity documents were checked by a person.");
        });

        it("should return the correct result for OPTION2 in Welsh", () => {
            const result = FormatService.formatHowIdentityDocsChecked("OPTION2", "cy");
            expect(result).toBe("Option 2 - The identity documents were checked by a person. Welsh");
        });

        it("should return the option itself if it is not recognized", () => {
            const result = FormatService.formatHowIdentityDocsChecked("UNKNOWN_OPTION", "en");
            expect(result).toBe("UNKNOWN_OPTION");
        });
    });
});
