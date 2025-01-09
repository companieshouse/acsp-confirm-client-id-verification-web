import { FormatService } from "../../../src/services/formatService";

describe("Format Service tests", () => {

    describe("formatDocumentHintText tests", () => {

        it("should return the hint text for option 1", () => {
            const documents = ["passport", "irish_passport_card"];
            const i18n = {
                biometricPassportHint: "Biometric Passport Hint",
                irishPassportHint: "Irish Passport Hint"
            };

            const hintText = FormatService.formatDocumentHintText(documents, "cryptographic_security_features_checked", i18n);
            expect(hintText).toStrictEqual(["Biometric Passport Hint", "Irish Passport Hint"]);
        });

        it("should return the hint text for option 2", () => {
            const documents = ["immigration_document_photo_id", "visa_photo_id"];
            const i18n = {
                photoimmigrationDocHint: "Photo Immigration Doc Hint",
                photoVisaHint: "Photo Visa Hint"
            };

            const hintText = FormatService.formatDocumentHintText(documents, "physical_security_features_checked", i18n);
            expect(hintText).toStrictEqual(["Photo Immigration Doc Hint", "Photo Visa Hint"]);
        });
    });
});