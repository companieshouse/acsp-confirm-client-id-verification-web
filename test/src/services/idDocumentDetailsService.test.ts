import { MockRequest, createRequest } from "node-mocks-http";
import { IdDocumentDetailsService } from "../../../src/services/idDocumentDetailsService";
import { getSessionRequestWithPermission } from "../../mocks/session.mock";
import { CRYPTOGRAPHIC_SECURITY_FEATURES, PHYSICAL_SECURITY_FEATURES, USER_DATA } from "../../../src/utils/constants";
import { Request } from "express";
jest.mock("../../../src/services/identityVerificationService.ts");

describe("IdDocumentDetailsService tests", () => {
    let req: MockRequest<Request>;
    let service: IdDocumentDetailsService;

    beforeEach(() => {
        service = new IdDocumentDetailsService();
    });

    it("should save id document details to the session", () => {
        req = createRequest({});
        const session = getSessionRequestWithPermission();
        req.session = session;
        req.body.documentNumber_1 = "1234";
        req.body.expiryDateDay_1 = "28";
        req.body.expiryDateMonth_1 = "2";
        req.body.expiryDateYear_1 = "2025";
        req.body.countryInput_1 = "India";
        const formattedDocs = ["UK biometric residence permit (BRP)"];

        service.saveIdDocumentDetails(req, {}, formattedDocs);
        const date = new Date(2025, 1, 28);
        expect(session.getExtraData(USER_DATA)).toEqual({
            idDocumentDetails: [{
                docName: "UK biometric residence permit (BRP)",
                documentNumber: "1234",
                expiryDate: date,
                countryOfIssue: "India",
                formattedExpiryDate: "28 February 2025"
            }]
        });
    });

    it("should set formattedExpiryDate to an empty string when expiry date is not given for optional expiry date ID doc", () => {
        // Arrange
        req = createRequest({});
        const session = getSessionRequestWithPermission();
        req.session = session;
        req.body.documentNumber_1 = "123456789";
        req.body.expiryDateDay_1 = undefined;
        req.body.expiryDateMonth_1 = undefined;
        req.body.expiryDateYear_1 = undefined;
        req.body.countryInput_1 = "England";

        const formattedDocs = ["UK HM Armed Forces Veteran Card"];

        service.saveIdDocumentDetails(req, {}, formattedDocs);

        expect(session.getExtraData(USER_DATA)).toEqual({
            idDocumentDetails: [{
                docName: "UK HM Armed Forces Veteran Card",
                documentNumber: "123456789",
                expiryDate: undefined,
                countryOfIssue: "England",
                formattedExpiryDate: ""
            }]
        });
    });

    it("should set documentNumber to an empty string when document number is not given for optional document number doc", () => {
        // Arrange
        req = createRequest({});
        const session = getSessionRequestWithPermission();
        req.session = session;
        req.body.documentNumber_1 = undefined;
        req.body.expiryDateDay_1 = undefined;
        req.body.expiryDateMonth_1 = undefined;
        req.body.expiryDateYear_1 = undefined;
        req.body.countryInput_1 = "England";

        const formattedDocs = ["Photographic ID listed on PRADO"];

        service.saveIdDocumentDetails(req, {}, formattedDocs);

        expect(session.getExtraData(USER_DATA)).toEqual({
            idDocumentDetails: [{
                docName: "Photographic ID listed on PRADO",
                documentNumber: "",
                expiryDate: undefined,
                countryOfIssue: "England",
                formattedExpiryDate: ""
            }]
        });
    });

    it("should set country to an empty string when country is not given for optional country doc", () => {
        // Arrange
        req = createRequest({});
        const session = getSessionRequestWithPermission();
        req.session = session;
        req.body.documentNumber_1 = "123456789";
        req.body.expiryDateDay_1 = undefined;
        req.body.expiryDateMonth_1 = undefined;
        req.body.expiryDateYear_1 = undefined;
        req.body.countryInput_1 = undefined;

        const formattedDocs = ["Photographic ID listed on PRADO"];

        service.saveIdDocumentDetails(req, {}, formattedDocs);

        expect(session.getExtraData(USER_DATA)).toEqual({
            idDocumentDetails: [{
                docName: "Photographic ID listed on PRADO",
                documentNumber: "123456789",
                expiryDate: undefined,
                countryOfIssue: "",
                formattedExpiryDate: ""
            }]
        });
    });

    it("should return an error array for expiry date errors", () => {
        const errors = [{ msg: "expiryDateInvalid", param: "expiryDateDay_1" }];
        const documentsChecked = ["UK biometric residence permit (BRP)"];
        const whenIdDocsChecked = new Date(2025, 1, 28);
        const howIdDocsChecked = CRYPTOGRAPHIC_SECURITY_FEATURES;
        const actual = service.errorListDisplay(errors, documentsChecked, "en", whenIdDocsChecked, howIdDocsChecked);
        const expected = [{ msg: "UK biometric residence permit (BRP) expiry date must be a real date" }];
        expect(actual[0].msg).toBe(expected[0].msg);
    });

    it("should return an error array for not expiry date errors", () => {
        const errors = [{ msg: "noCountry", param: "countryInput_1" }];
        const documentsChecked = ["UK biometric residence permit (BRP)"];
        const whenIdDocsChecked = new Date(2025, 1, 28);
        const howIdDocsChecked = CRYPTOGRAPHIC_SECURITY_FEATURES;
        const actual = service.errorListDisplay(errors, documentsChecked, "en", whenIdDocsChecked, howIdDocsChecked);
        const expected = [{ msg: "Choose a country for UK biometric residence permit (BRP)" }];
        expect(actual[0].msg).toBe(expected[0].msg);
    });

    it("should not return an error array for expiry date non mandatory docs when expiry date not given", () => {
        const errors = [{ msg: "noExpiryDate", param: "expiryDateDay_1" }];
        const documentsChecked = ["UK accredited PASS card"];
        const whenIdDocsChecked = new Date(2025, 1, 28);
        const howIdDocsChecked = CRYPTOGRAPHIC_SECURITY_FEATURES;
        const actual = service.errorListDisplay(errors, documentsChecked, "en", whenIdDocsChecked, howIdDocsChecked);
        expect(actual.length).toBe(0);
    });

    it("should not return an error array for expiry date non mandatory docs when expiry date not given", () => {
        const errors = [{ msg: "noExpiryDate", param: "expiryDateDay_1" }];
        const documentsChecked = ["UK HM Armed Forces Veteran Card"];
        const whenIdDocsChecked = new Date(2025, 1, 28);
        const howIdDocsChecked = CRYPTOGRAPHIC_SECURITY_FEATURES;
        const actual = service.errorListDisplay(errors, documentsChecked, "en", whenIdDocsChecked, howIdDocsChecked);
        expect(actual.length).toBe(0);
    });

    it("should return an error array for expiry date non mandatory docs if error expiry date given ", () => {
        const errors = [{ msg: "dateAfterIdChecksDone", param: "expiryDateDay_1" }];
        const documentsChecked = ["UK accredited PASS card"];
        const whenIdDocsChecked = new Date(2025, 2, 28);
        const howIdDocsChecked = CRYPTOGRAPHIC_SECURITY_FEATURES;
        const actual = service.errorListDisplay(errors, documentsChecked, "en", whenIdDocsChecked, howIdDocsChecked);
        const expected = [{ msg: "Expiry date for UK accredited PASS card must be after 28 March 2025 when you completed the identity checks" }];
        expect(actual[0].msg).toBe(expected[0].msg);
    });

    it("should return an error array for expiry date non mandatory docs if error expiry date given ", () => {
        const errors = [{ msg: "expiryDateNonNumeric", param: "expiryDateDay_1" }];
        const documentsChecked = ["UK accredited PASS card"];
        const whenIdDocsChecked = new Date(2025, 2, 28);
        const howIdDocsChecked = CRYPTOGRAPHIC_SECURITY_FEATURES;
        const actual = service.errorListDisplay(errors, documentsChecked, "en", whenIdDocsChecked, howIdDocsChecked);
        const expected = [{ msg: "UK accredited PASS card must only include numbers" }];
        expect(actual[0].msg).toBe(expected[0].msg);
    });
});

describe("errorListDisplay for PRADO", () => {
    const service = new IdDocumentDetailsService();
    test.each([
        [
            [{ msg: "noExpiryDate", param: "expiryDateDay_1" }],
            ["Photographic ID listed on PRADO"],
            new Date(2025, 2, 28),
            CRYPTOGRAPHIC_SECURITY_FEATURES,
            0
        ],
        [
            [{ msg: "noCountry", param: "countryInput_1" }],
            ["Photographic ID listed on PRADO"],
            new Date(2025, 2, 28),
            CRYPTOGRAPHIC_SECURITY_FEATURES,
            0
        ],
        [
            [{ msg: "docNumberInput", param: "documentNumber_1" }],
            ["Photographic ID listed on PRADO"],
            new Date(2025, 2, 28),
            CRYPTOGRAPHIC_SECURITY_FEATURES,
            0
        ]
    ])(
        "should not return an error array for non-mandatory fields for PRADO",
        (errors, documentsChecked, whenIdDocsChecked, howIdDocsChecked, expectedLength) => {
            const actual = service.errorListDisplay(errors, documentsChecked, "en", whenIdDocsChecked, howIdDocsChecked);
            expect(actual.length).toBe(expectedLength);
        }
    );
});
describe("IdDocumentDetailsService - physical_security_features_checked", () => {
    const idDocumentDetailsService = new IdDocumentDetailsService();

    it("should populate documentsWithGracedExpiryMap with OPTION_2_ID_DOCUMENTS_WITH_GRACED_EXPIRY when typeOfTheDocumentCheck is physical_security_features_checked", () => {
        const mockErrors = [
            { msg: "passport", param: "expiryDate_1" }
        ];
        const mockDocumentsChecked = ["passport"];
        const mockLang = "en";
        const mockWhenIdDocsChecked = new Date("2025-03-01");
        const mockTypeOfTheDocumentCheck = PHYSICAL_SECURITY_FEATURES;

        const result = idDocumentDetailsService.errorListDisplay(
            mockErrors,
            mockDocumentsChecked,
            mockLang,
            mockWhenIdDocsChecked,
            mockTypeOfTheDocumentCheck
        );
        expect(result[0].msg).toContain("18");
    });
});
