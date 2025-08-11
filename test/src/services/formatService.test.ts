import { FormatService } from "../../../src/services/formatService";
import { CRYPTOGRAPHIC_SECURITY_FEATURES, PHYSICAL_SECURITY_FEATURES } from "../../../src/utils/constants";

describe("Format Service tests", () => {

    describe("escapeHtml tests", () => {
        it("should return empty string when input is undefined", () => {
            const result = FormatService.escapeHtml(undefined);
            expect(result).toBe("");
        });

        it("should escape angle brackets", () => {
            const result = FormatService.escapeHtml("<testAngleBrackets>");
            expect(result).toBe("&lt;testAngleBrackets&gt;");
        });

        it("should not modify text without angle brackets", () => {
            const result = FormatService.escapeHtml("Test no angle brackets");
            expect(result).toBe("Test no angle brackets");
        });

        it("should handle multiple angle brackets", () => {
            const result = FormatService.escapeHtml("<b>Some string data</b>");
            expect(result).toBe("&lt;b&gt;Some string data&lt;/b&gt;");
        });
    });

    describe("formatAddress tests", () => {
        it("should handle undefined address", () => {
            const result = FormatService.formatAddress(undefined);
            expect(result).toBe("");
        });

        it("should escape HTML in address fields that may contain angle brackets but NOT in postcode", () => {
            const address = {
                propertyDetails: "Flat <A>",
                line1: "<123> Main Street",
                line2: "Suite <B>",
                town: "London",
                county: "Greater London",
                country: "United Kingdom",
                postcode: "SW1<1>AA"
            };

            const result = FormatService.formatAddress(address);

            expect(result).toContain("Flat &lt;A&gt; &lt;123&gt; Main Street");
            expect(result).toContain("Suite &lt;B&gt;");
            expect(result).toContain("SW1<1>AA"); // Postcode should NOT be escaped
            expect(result).toContain("London");
            expect(result).toContain("Greater London");
            expect(result).toContain("United Kingdom");
        });

        it("should join address parts with <br>", () => {
            const address = {
                propertyDetails: "Flat 1",
                line1: "123 Main Street",
                line2: "Area",
                town: "London",
                county: "Greater London",
                country: "United Kingdom",
                postcode: "SW1A 1AA"
            };

            const result = FormatService.formatAddress(address);
            const parts = result.split("<br>");

            expect(parts.length).toBe(6);
            expect(parts[0]).toContain("Flat 1 123 Main Street");
            expect(parts[1]).toBe("Area");
            expect(parts[2]).toBe("London");
            expect(parts[3]).toBe("Greater London");
            expect(parts[4]).toBe("United Kingdom");
            expect(parts[5]).toBe("SW1A 1AA");
        });
    });

    describe("formatDocumentHintText tests", () => {

        it("should return the hint text for option 1", () => {
            const documents = ["biometric_passport", "irish_passport_card"];
            const i18n = {
                biometricPassportHint: "Biometric Passport Hint",
                irishPassportHint: "Irish Passport Hint"
            };

            const hintText = FormatService.formatDocumentHintText(documents, CRYPTOGRAPHIC_SECURITY_FEATURES, i18n);
            expect(hintText).toStrictEqual(["Biometric Passport Hint", "Irish Passport Hint"]);
        });

        it("should return the hint text for option 2", () => {
            const documents = ["immigration_document_photo_id", "visa_photo_id"];
            const i18n = {
                photoimmigrationDocHint: "Photo Immigration Doc Hint",
                photoVisaHint: "Photo Visa Hint"
            };

            const hintText = FormatService.formatDocumentHintText(documents, PHYSICAL_SECURITY_FEATURES, i18n);
            expect(hintText).toStrictEqual(["Photo Immigration Doc Hint", "Photo Visa Hint"]);
        });
    });
});
