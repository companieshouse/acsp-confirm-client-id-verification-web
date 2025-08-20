import { Request } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { USER_DATA } from "../utils/constants";
import { ClientData } from "../model/ClientData";
import { saveDataInSession } from "../utils/sessionHelper";

export class PersonsNameService {
    public static savePersonsNameData (req: Request): void {
        const session: Session = req.session as any as Session;
        const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};

        // Save person's name data to session
        clientData.firstName = req.body["first-name"];
        clientData.middleName = req.body["middle-names"];
        clientData.lastName = req.body["last-name"];

        saveDataInSession(req, USER_DATA, clientData);
    }
}
