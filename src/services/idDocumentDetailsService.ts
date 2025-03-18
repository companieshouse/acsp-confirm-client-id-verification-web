import { ClientData } from "../model/ClientData";
import { DocumentDetails } from "../model/DocumentDetails";
import { Request } from "express";
import { saveDataInSession } from "../utils/sessionHelper";
import { USER_DATA } from "../utils/constants";
import { resolveErrorMessage } from "../validations/validation";
import { FormatService } from "./formatService";
import { getLocalesService } from "../utils/localise";

export class IdDocumentDetailsService {
    public saveIdDocumentDetails = (req: Request, clientData: ClientData, formattedDocumentsChecked: string[], i18n: any) => {
        const documentDetails: DocumentDetails[] = [];
        clientData.idDocumentDetails = documentDetails;
        for (let i = 0; i < formattedDocumentsChecked.length; i++) {
            const j = i + 1;
            const docNumberId = "documentNumber_" + j;
            const expiryDateDayId = "expiryDateDay_" + j;
            const expiryDateMonthId = "expiryDateMonth_" + j;
            const expiryDateYearId = "expiryDateYear_" + j;
            const countryOfIssueId = "countryInput_" + j;
            let expiryDate;
            if (req.body[expiryDateYearId] && req.body[expiryDateMonthId] && req.body[expiryDateDayId]) {
                expiryDate = new Date(
                    req.body[expiryDateYearId],
                    req.body[expiryDateMonthId] - 1,
                    req.body[expiryDateDayId]
                );
            }
            documentDetails.push({
                documentNumber: req.body[docNumberId] ? req.body[docNumberId] : i18n.dateNotProvided,
                expiryDate: expiryDate,
                countryOfIssue: req.body[countryOfIssueId] ? req.body[countryOfIssueId] : i18n.dateNotProvided,
                docName: formattedDocumentsChecked[i],
                formattedExpiryDate: FormatService.formatDate(expiryDate, i18n)
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
            let errorMessage = resolveErrorMessage(element.msg, lang);
            const parts: string[] = element.param.split("_");
            const index = Number(parts[1]);
            const docName = documentsChecked[index - 1];
            const locales = getLocalesService();

            errorMessage = getErrorForSpecificDocs(docName, errorMessage, errorText, whenIdDocsChecked, locales.i18nCh.resolveNamespacesKeys(lang));
            // if error message is not empty, replace doc name placeholder
            if (errorMessage !== "") {
                element.msg = errorMessage.replace("{doc selected}", docName);
                newErrorArray.push(element);
            }
        });
        return newErrorArray;
    };
}

const getErrorForSpecificDocs = (docName:string, errorMessage: string, errorText: string, whenIdDocsChecked:Date, i18n: any) => {
    // make error message empty for optional fields for below specific docs
    if (((docName === i18n.UK_PASS_card || docName === i18n.UK_HM_veteran_card) && errorText === "noExpiryDate") ||
        ((docName === i18n.PRADO_supported_photo_id || docName === i18n.work_permit_photo_id) &&
         (errorText === "noExpiryDate" || errorText === "noCountry" || errorText === "docNumberInput"))) {
        return "";
    // replace date placeholder with formatted date if error is about invalid expirydate
    } else if (errorText === "dateAfterIdChecksDone") {
        const idChecksCompletedDate = whenIdDocsChecked.getDate() + " " +
                                      whenIdDocsChecked.toLocaleString("default", { month: "long" }) + " " +
                                      whenIdDocsChecked.getFullYear();
        errorMessage = errorMessage.replace("{id checks completed}", idChecksCompletedDate);
        return errorMessage;
    // for non of the above return back error message as it is
    } else {
        return errorMessage;
    }
};
