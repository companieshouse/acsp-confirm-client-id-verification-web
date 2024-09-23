import { Request } from "express";
import { createRequest, MockRequest } from "node-mocks-http";
import { getSessionRequestWithPermission } from "../../mocks/session.mock";
import { CheckedDocumentsService, DocumentsGroup } from "../../../src/services/checkedDocumentsService";
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

    it("should save grouped documents from group 2A and 2B to the session", () => {
        const documentsGroup: DocumentsGroup = {
            documentsGroup2A: ["ukBRC", "photoimmigrationDoc"],
            documentsGroup2B: ["rentalAgreement"]
        };
        const session: Session = req.session as any as Session;
        service.saveDocumentGroupAB(req, {}, documentsGroup);

        expect(session.getExtraData(USER_DATA)).toEqual({
            documentsChecked: ["ukBRC", "photoimmigrationDoc", "rentalAgreement"]
        });
    });

    it("should handle cases where documentsGroup2A and documentsGroup2B are single items", () => {
        const documentsGroup: DocumentsGroup = {
            documentsGroup2A: "ukBRC",
            documentsGroup2B: "rentalAgreement"
        };
        const session: Session = req.session as any as Session;
        service.saveDocumentGroupAB(req, {}, documentsGroup);

        expect(session.getExtraData(USER_DATA)).toEqual({
            documentsChecked: ["ukBRC", "rentalAgreement"]
        });
    });

    it("should handle cases where documentsGroup2B is empty", () => {
        const documentsGroup: DocumentsGroup = {
            documentsGroup2A: ["ukBRC", "photoimmigrationDoc"],
            documentsGroup2B: ""
        };
        const session: Session = req.session as any as Session;
        service.saveDocumentGroupAB(req, {}, documentsGroup);

        expect(session.getExtraData(USER_DATA)).toEqual({
            documentsChecked: ["ukBRC", "photoimmigrationDoc"]
        });
    });

    it("should handle empty document groups", () => {
        const documentsGroup: DocumentsGroup = {
            documentsGroup2A: [],
            documentsGroup2B: []
        };
        const session: Session = req.session as any as Session;
        service.saveDocumentGroupAB(req, {}, documentsGroup);

        expect(session.getExtraData(USER_DATA)).toEqual({
            documentsChecked: []
        });
    });

});
