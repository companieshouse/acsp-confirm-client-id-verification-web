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

        const documentDetails: DocumentDetails[] = [];
        for (let i = 0; i < formattedDocumentsChecked.length; i++) {
            const j = i + 1;
            const docNumberId = "documentNumber_" + j;
            const expiryDateDayId = "expiryDateDay_" + j;
            const expiryDateMonthId = "expiryDateMonth_" + j;
            const expiryDateYearId = "expiryDateYear_" + j;
            const countryOfIssueId = "countryInput_" + j;

            const expiryDate = new Date(
                req.body[expiryDateDayId],
                req.body[expiryDateMonthId] - 1,
                req.body[expiryDateYearId]
            );

            documentDetails.push({
                documentNumber: req.body[docNumberId],
                expiryDate: expiryDate,
                countryOfIssue: req.body[countryOfIssueId]
            });
        }
        if (clientData) {
            clientData.idDocumentDetails = documentDetails;
        }

        saveDataInSession(req, USER_DATA, clientData);
    };
}
