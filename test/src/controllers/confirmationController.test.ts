import mocks from "../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../src/app";
import { BASE_URL, CONFIRMATION, CHECK_YOUR_ANSWERS } from "../../../src/types/pageURL";
import { ClientData } from "../../../src/model/ClientData";
import { FormatService } from "../../../src/services/formatService";

jest.mock("../../../src/services/formatService.ts");

const router = supertest(app);

const mockAddress = {
    propertyDetails: "1",
    line1: "Street",
    line2: "Line 2",
    town: "Town",
    county: "County",
    country: "Country",
    postcode: "AB12CD"
};

const mockClientData: ClientData = {
    address: mockAddress,
    dateOfBirth: new Date("1990-01-01"),
    whenIdentityChecksCompleted: new Date("2024-01-01"),
    documentsChecked: ["biometricPassport"],
    howIdentityDocsChecked: "OPTION1"
};

describe("GET " + BASE_URL + CONFIRMATION, () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mocks.mockSessionMiddleware.mockImplementation((req, res, next) => {
            req.session = {
                getExtraData: jest.fn().mockReturnValue(mockClientData)
            };
            next();
        });
    });

    it("should return status 200 and render the confirmation page with formatted data", async () => {
        const res = await router.get(BASE_URL + CONFIRMATION + "?lang=en");
        expect(res.status).toBe(200);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(res.text).toContain("Identity verified successfully");
    });

    it("should format the client data correctly", async () => {
        await router.get(BASE_URL + CONFIRMATION + "?lang=en");
        expect(FormatService.formatAddress).toHaveBeenCalledWith(mockClientData.address);
        expect(FormatService.formatDocumentsChecked).toHaveBeenCalledWith(mockClientData.documentsChecked, "en");
        expect(FormatService.formatHowIdentityDocsChecked).toHaveBeenCalledWith(mockClientData.howIdentityDocsChecked, "en");
    });
});
