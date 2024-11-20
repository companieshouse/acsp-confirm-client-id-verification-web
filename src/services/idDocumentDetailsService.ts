import { ClientData } from "../model/ClientData";
import { LocalesService } from "@companieshouse/ch-node-utils";
import { DocumentDetails } from "../model/DocumentDetails";
import { Request } from "express";
import { saveDataInSession } from "../utils/sessionHelper";
import { USER_DATA } from "../utils/constants";
import { resolveErrorMessage } from "../validations/validation";

export class IdDocumentDetailsService {
    public saveIdDocumentDetails = (req: Request, clientData: ClientData, locales: LocalesService, lang: string, formattedDocumentsChecked: string[]) => {

        const documentDetails: DocumentDetails[] = [];
        clientData.idDocumentDetails = documentDetails;

        for (let i = 0; i < formattedDocumentsChecked.length; i++) {
            const j = i + 1;
            const docNumberId = "documentNumber_" + j;
            const expiryDateDayId = "expiryDateDay_" + j;
            const expiryDateMonthId = "expiryDateMonth_" + j;
            const expiryDateYearId = "expiryDateYear_" + j;
            const countryOfIssueId = "countryInput_" + j;

            const expiryDate = new Date(
                req.body[expiryDateYearId],
                req.body[expiryDateMonthId] - 1,
                req.body[expiryDateDayId]
            );

            documentDetails.push({
                documentNumber: req.body[docNumberId],
                expiryDate: expiryDate,
                countryOfIssue: req.body[countryOfIssueId],
                docName: formattedDocumentsChecked[i]
            });
        }

        if (clientData) {
            clientData.idDocumentDetails = documentDetails;
        }

        saveDataInSession(req, USER_DATA, clientData);
    }

    public errorListDisplay = (errors: any[], documentsChecked: string[], lang: string, whenIdDocsChecked: Date) => {
        const newErrorArray: any[] = [];

        errors.forEach((element) => {
            const errorText = element.msg;
            const errorMessage: string = resolveErrorMessage(element.msg, lang);

            // document number
            if (element.param.includes("documentNumber_")) {
                const index = element.param.substr("documentNumber_".length) - 1;
                const docName = documentsChecked[index];
                element.msg = errorMessage.replace("{doc selected}", docName);

            // expiry date
            } else if (element.param.includes("expiryDate")) {
                let index: number;
                if (element.param.includes("expiryDateDay")) {
                    index = element.param.substr("expiryDateDay_".length) - 1;
                } else if (element.param.includes("expiryDateMonth")) {
                    index = element.param.substr("expiryDateMonth_".length) - 1;
                } else if (element.param.includes("expiryDateYear")) {
                    index = element.param.substr("expiryDateYear_".length) - 1;
                }
                const docName = documentsChecked[index!];
                if ((docName === "UK accredited PASS card" && errorText !== "dateAfterIdChecksDone") ||
                    (docName === "UK HM Armed Forces Veteran Card" && errorText !== "dateAfterIdChecksDone")) {
                    return;
                }

                if (errorText === "dateAfterIdChecksDone") {
                    const month = whenIdDocsChecked.toLocaleString("default", { month: "long" });
                    const idChecksCompletedDate = whenIdDocsChecked.getDate() + " " +
                                                  whenIdDocsChecked.toLocaleString("default", { month: "long" }) + " " +
                                                  whenIdDocsChecked.getFullYear();
                    const errorMessage1 = errorMessage.replace("{id checks completed}", idChecksCompletedDate);
                    element.msg = errorMessage1.replace("{doc selected}", docName);
                } else {
                    element.msg = errorMessage.replace("{doc selected}", docName);
                }
            // country input
            } else if (element.param.includes("countryInput")) {
                const index = element.param.substr("countryInput_".length) - 1;
                const docName = documentsChecked[index];
                if (docName === undefined) {
                    return;
                }
                element.msg = errorMessage.replace("{doc selected}", docName);
            }
            newErrorArray.push(element);
        });
        return newErrorArray;
    }
}
