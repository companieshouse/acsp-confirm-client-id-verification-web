import { ClientData } from "../model/ClientData";
import { DocumentDetails } from "../model/DocumentDetails";
import { Request } from "express";
import { saveDataInSession } from "../utils/sessionHelper";
import { USER_DATA } from "../utils/constants";
import { resolveErrorMessage } from "../validations/validation";
import { FormatService } from "./formatService";

export class IdDocumentDetailsService {
    public saveIdDocumentDetails = (req: Request, clientData: ClientData, formattedDocumentsChecked: string[]) => {
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
                docName: formattedDocumentsChecked[i],
                formattedExpiryDate: FormatService.formatDate(expiryDate)
            });
        }
        if (clientData) {
            clientData.idDocumentDetails = documentDetails;
        }
        saveDataInSession(req, USER_DATA, clientData);
    }

    public errorListDisplay = (errors: any[], documentsChecked: string[], lang: string, whenIdDocsChecked: Date): any[] => {
        const newErrorArray: any[] = [];
        errors.forEach((element) => {
            const errorText = element.msg;
            const errorMessage: string = resolveErrorMessage(element.msg, lang);
            const parts: string[] = element.param.split("_");
            const index = Number(parts[1]);
            const docName = documentsChecked[index - 1];

            if (element.param.includes("expiryDate")) {
                element.msg = getErrorForExpiryDate(docName, errorMessage, errorText, whenIdDocsChecked);
                if (element.msg === "") {
                    return;
                }
            } else {
                element.msg = errorMessage.replace("{doc selected}", docName);
            }
            newErrorArray.push(element);
        });
        return newErrorArray;
    };
}

const getErrorForExpiryDate = (docName:string, errorMessage: string, errorText: string, whenIdDocsChecked:Date) => {
    if ((docName === "UK accredited PASS card" && errorText === "noExpiryDate") ||
        (docName === "UK HM Armed Forces Veteran Card" && errorText === "noExpiryDate")) {
        return "";
    }
    if (errorText === "dateAfterIdChecksDone") {
        const idChecksCompletedDate = whenIdDocsChecked.getDate() + " " +
                                      whenIdDocsChecked.toLocaleString("default", { month: "long" }) + " " +
                                      whenIdDocsChecked.getFullYear();
        errorMessage = errorMessage.replace("{id checks completed}", idChecksCompletedDate);
    }
    return errorMessage.replace("{doc selected}", docName);
};
