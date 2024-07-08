import { Session } from "@companieshouse/node-session-handler";
import { ClientData } from "../model/ClientData";
import { USER_DATA } from "../utils/constants";
import { Request } from "express";

export class CheckedDocumentsService {
    public saveDocumentsToSession (req: Request, documents: string | string[]): void {
        const session: Session = req.session as any as Session;
        const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};
        if (!(documents instanceof Array)) {
            const documentArray = [];
            documentArray.push(documents);
            clientData.documentsChecked = documentArray;
        } else {
            clientData.documentsChecked = documents;
        }

        session.setExtraData(USER_DATA, clientData);
    }
}
