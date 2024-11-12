import { ClientData } from "../model/ClientData";
import { FormatService } from "./formatService";
import { LocalesService } from "@companieshouse/ch-node-utils";
import { DocumentDetails } from "../model/DocumentDetails";
import { Request } from "express";
import { saveDataInSession } from "../utils/sessionHelper";
import { USER_DATA } from "../utils/constants";

export class idDocumentDetailsService {
    public saveIdDocumentDetails = (req: Request, clientData: ClientData, locales: LocalesService, lang: string) => {
        const formattedDocumentsChecked = FormatService.formatDocumentsCheckedText(
            clientData.documentsChecked,
            locales.i18nCh.resolveNamespacesKeys(lang)
        );

        const documentDetails: Array<DocumentDetails> = [];
        for (let i = 0; i < formattedDocumentsChecked.length; i++) {
            const j = i + 1;
            const docNumberId = "documentNumber_" + j;
            const expiryDateId = "expiryDate_" + j;
            const countryOfIssueId = "countryInput_" + j;
            documentDetails.push({
                documentNumber: req.body[docNumberId],
                expiryDate: req.body[expiryDateId],
                countryOfIssue: req.body[countryOfIssueId]
            });
        }
        if (clientData) {
            clientData.idDocumentDetails = documentDetails;
        }

        console.log("saving----->", JSON.stringify(clientData.idDocumentDetails));
        saveDataInSession(req, USER_DATA, clientData);
    };
}
