import { Session } from "@companieshouse/node-session-handler";
import { ClientData } from "../model/ClientData";
import { USER_DATA } from "../utils/constants";
import { Request } from "express";

export interface DocumentsGroup {
    documentsGroup2A: string | string[];
    documentsGroup2B: string | string[];
}

export class CheckedDocumentsService {
    public saveDocuments (req: Request, clientData: ClientData, documents: string | string[]): void {
        const session: Session = req.session as any as Session;
        if (!(documents instanceof Array)) {
            const documentArray = [];
            documentArray.push(documents);
            clientData.documentsChecked = documentArray;
        } else {
            clientData.documentsChecked = documents;
        }

        session.setExtraData(USER_DATA, clientData);
    }

    public saveDocumentGroupAB (req: Request, clientData: ClientData, documents: DocumentsGroup): void {
        const session: Session = req.session as any as Session;
        const documentsGroup2A = Array.isArray(documents.documentsGroup2A)
            ? documents.documentsGroup2A
            : [documents.documentsGroup2A];
        const documentsGroup2B = Array.isArray(documents.documentsGroup2B)
            ? documents.documentsGroup2B
            : [documents.documentsGroup2B];
        clientData.documentsChecked = [...documentsGroup2A, ...documentsGroup2B];

        session.setExtraData(USER_DATA, clientData);
    }
}
