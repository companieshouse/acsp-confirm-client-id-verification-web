import { MockRequest, createRequest } from "node-mocks-http";
import { IdDocumentDetailsService } from "../../../src/services/idDocumentDetailsService";
import { ClientData } from "../../../src/model/ClientData";
import { getSessionRequestWithPermission } from "../../mocks/session.mock";
import { USER_DATA } from "../../../src/utils/constants";
import { Request } from "express";
import { Session } from "@companieshouse/node-session-handler";

describe("IdDocumentDetailsService tests", () => {
    let req: MockRequest<Request>;
    let service: IdDocumentDetailsService;

    beforeEach(() => {
        service = new IdDocumentDetailsService();
        req = createRequest({

        });
        const session = getSessionRequestWithPermission();
        req.session = session;
        req.body.documentNumber_1 = "1234";
        req.body.expiryDateDay_1 = "28";
        req.body.expiryDateMonth_1 = "2";
        req.body.expiryDateYear_1 = "2025";
        req.body.countryInput_1 = "India";
    });

    it("should save id document details to the session", () => {
        const formattedDocs = ["UK biometric residence permit (BRP)"];
        const session: Session = req.session as any as Session;
        service.saveIdDocumentDetails(req, {}, formattedDocs);
        const date = new Date(2025, 1, 28);
        expect(session.getExtraData(USER_DATA)).toEqual({
            idDocumentDetails: [{
                docName: "UK biometric residence permit (BRP)",
                documentNumber: "1234",
                expiryDate: date,
                countryOfIssue: "India"
            }]
        });
    });
});
