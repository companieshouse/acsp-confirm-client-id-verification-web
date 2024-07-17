import { Request } from "express";
import { createRequest, MockRequest } from "node-mocks-http";
import { getSessionRequestWithPermission } from "../../mocks/session.mock";
import { CheckedDocumentsService } from "../../../src/services/checkedDocumentsService";
import { Session } from "@companieshouse/node-session-handler";
import { USER_DATA } from "../../../src/utils/constants";

describe("CheckedDocumentsService tests", () => {
    let req: MockRequest<Request>;
    let service: CheckedDocumentsService;

    beforeEach(() => {
        service = new CheckedDocumentsService();
        req = createRequest({});
        const session = getSessionRequestWithPermission();
        req.session = session;
    });

    it("should save the selected document to an array in the session", () => {
        const selectedDocument = "biometricPassport";
        const session: Session = req.session as any as Session;
        service.saveDocuments(req, {}, selectedDocument);

        expect(session.getExtraData(USER_DATA)).toEqual({
            documentsChecked: ["biometricPassport"]
        });
    });

    it("should save the selected documents to an array in the session", () => {
        const selectedDocuments = ["biometricPassport", "irishPassport"];
        const session: Session = req.session as any as Session;
        service.saveDocuments(req, {}, selectedDocuments);

        expect(session.getExtraData(USER_DATA)).toEqual({
            documentsChecked: ["biometricPassport", "irishPassport"]
        });
    });
});
