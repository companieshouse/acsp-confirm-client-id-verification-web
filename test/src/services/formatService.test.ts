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

    describe("findDocumentName tests", () => {

        it("should return the document name for option 1 doc", () => {
            const document = "irish_passport_card";
            const i18n = {
                irishPassport: "Irish passport card"
            };
            const howIdentityDocsChecked = "cryptographic_security_features_checked";

            const docName = FormatService.findDocumentName(document, i18n, howIdentityDocsChecked);
            expect(docName).toStrictEqual("Irish passport card");
        });

        it("should return the document name for option 2 doc Group A", () => {
            const document = "visa_photo_id";
            const i18n = {
                photoVisa: "Photo Visa"
            };
            const howIdentityDocsChecked = "physical_security_features_checked";

            const docName = FormatService.findDocumentName(document, i18n, howIdentityDocsChecked);
            expect(docName).toStrictEqual("Photo Visa");
        });

        it("should return empty string for option 2 doc Group B", () => {
            const document = "utility_bill";
            const i18n = {
                utilityBill: "Utility bill (for the person’s current address)"
            };
            const howIdentityDocsChecked = "physical_security_features_checked";

            const docName = FormatService.findDocumentName(document, i18n, howIdentityDocsChecked);
            expect(docName).toStrictEqual("");
        });

        it("should return empty string for no document Option 1", () => {
            const document = undefined;
            const i18n = {};
            const howIdentityDocsChecked = "cryptographic_security_features_checked";

            const docName = FormatService.findDocumentName(document, i18n, howIdentityDocsChecked);
            expect(docName).toStrictEqual("");
        });
    });
});
