import mocks from "../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../src/app";
import { BASE_URL, CONFIRMATION } from "../../../src/types/pageURL";
import { ClientData } from "../../../src/model/ClientData";
import { FormatService } from "../../../src/services/formatService";
import { getLocalesService } from "../../../src/utils/localise";
import { getSessionRequestWithPermission } from "../../mocks/session.mock";
import { createRequest } from "node-mocks-http";
import { session } from "../../mocks/session_middleware_mock";
import { USER_DATA, ACSP_DETAILS, ADDRESS_LIST } from "../../../src/utils/constants";
import { sessionMiddleware } from "../../../src/middleware/session_middleware";
import { Request, Response, NextFunction } from "express";
import { dummyFullProfile } from "../../mocks/acsp_profile.mock";
import { addressList } from "../../mocks/address.mock";

jest.mock("../../../src/services/formatService.ts");

const router = supertest(app);

describe("GET " + BASE_URL + CONFIRMATION, () => {
    let req;
    beforeEach(() => {
        jest.clearAllMocks();
        req = createRequest({
            method: "POST",
            url: "/"
        });
        const session = getSessionRequestWithPermission();
        session.setExtraData(USER_DATA, {
            idDocumentDetails: [
                {
                    docName: "passport",
                    documentNumber: "123456789",
                    expiryDate: new Date("2030-01-01"),
                    countryOfIssue: "UK"
                }
            ],
            address: {
                propertyDetails: "2",
                line1: "DUNCALF STREET",
                town: "STOKE-ON-TRENT",
                country: "GB-ENG",
                postcode: "ST6 3LJ"
            },
            documentsChecked: [
                ["passport"]
            ],
            howIdentityDocsChecked: "cryptographic_security_features_checked"
        });
        req.session = session;
    });

    it("should return status 200 and render the confirmation page with formatted data", async () => {
        const res = await router.get(BASE_URL + CONFIRMATION + "?lang=en");
        expect(res.status).toBe(200);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(res.text).toContain("Identity verified successfully");
    });

    it("should format the client data correctly", async () => {
        const locales = getLocalesService();
        await router.get(BASE_URL + CONFIRMATION + "?lang=en");
        const clientData: ClientData = session.getExtraData(USER_DATA)!;
        expect(FormatService.formatAddress).toHaveBeenCalledWith(
            clientData.address
        );
        expect(FormatService.formatDocumentsChecked).toHaveBeenCalledWith(
            clientData.documentsChecked,
            locales.i18nCh.resolveNamespacesKeys("en")
        );
    });
});
