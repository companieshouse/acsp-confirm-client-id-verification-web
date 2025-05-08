import { FormatService } from "../../../src/services/formatService";
import { CRYPTOGRAPHIC_SECURITY_FEATURES, PHYSICAL_SECURITY_FEATURES } from "../../../src/utils/constants";

describe("Format Service tests", () => {

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
