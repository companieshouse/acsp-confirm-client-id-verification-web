import { Session } from "@companieshouse/node-session-handler";
import { NextFunction, Request, Response } from "express";
import countryList from "../lib/countryList";
import * as config from "../config";
import { BASE_URL, CHECK_YOUR_ANSWERS, CONFIRM_IDENTITY_VERIFICATION, ID_DOCUMENT_DETAILS, WHICH_IDENTITY_DOCS_CHECKED_GROUP1, WHICH_IDENTITY_DOCS_CHECKED_GROUP2 } from "../types/pageURL";
import { ClientData } from "../model/ClientData";
import { CHECK_YOUR_ANSWERS_FLAG, CRYPTOGRAPHIC_SECURITY_FEATURES, USER_DATA } from "../utils/constants";
import { formatValidationError, getPageProperties } from "../validations/validation";
import { validationResult } from "express-validator";
import {
    addLangToUrl,
    getLocaleInfo,
    getLocalesService,
    selectLang
} from "../utils/localise";
import { FormatService } from "../services/formatService";
import { IdDocumentDetailsService } from "../services/idDocumentDetailsService";
import { DocumentDetails } from "../model/DocumentDetails";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const session: Session = req.session as any as Session;
        const clientData: ClientData = session?.getExtraData(USER_DATA)!;
        console.log(JSON.stringify(clientData.documentsChecked));
        console.log(JSON.stringify(clientData.howIdentityDocsChecked));
        console.log(JSON.stringify(locales.i18nCh.resolveNamespacesKeys(lang)));
        const formattedHintText = FormatService.formatDocumentHintText(clientData.documentsChecked, clientData.howIdentityDocsChecked, locales.i18nCh.resolveNamespacesKeys(lang));
        const formattedDocumentsChecked = FormatService.formatDocumentsCheckedText(
            clientData.documentsChecked,
            clientData.howIdentityDocsChecked,
            locales.i18nCh.resolveNamespacesKeys(lang)
        );
        let payload;
        if (clientData.idDocumentDetails != null) {
            payload = createPayload(clientData.idDocumentDetails, formattedDocumentsChecked, locales.i18nCh.resolveNamespacesKeys(lang));
        }

        res.render(config.ID_DOCUMENT_DETAILS, {
            previousPage: addLangToUrl(getBackUrl(clientData.howIdentityDocsChecked!), lang),
            ...getLocaleInfo(locales, lang),
            currentUrl: BASE_URL + ID_DOCUMENT_DETAILS,
            documentsChecked: formattedDocumentsChecked,
            hintText: formattedHintText,
            countryList: countryList,
            payload
        });
    } catch (error) {
        next(error);
    }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const session: Session = req.session as any as Session;
        const currentUrl: string = BASE_URL + ID_DOCUMENT_DETAILS;
        const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};

        const errorList = validationResult(req);
        const formattedHintText = FormatService.formatDocumentHintText(clientData.documentsChecked, clientData.howIdentityDocsChecked, locales.i18nCh.resolveNamespacesKeys(lang));
        const formattedDocumentsChecked = FormatService.formatDocumentsCheckedText(
            clientData.documentsChecked,
            clientData.howIdentityDocsChecked,
            locales.i18nCh.resolveNamespacesKeys(lang)
        );

        const documentDetailsService = new IdDocumentDetailsService();
        const whenIdentityChecksCompleted = new Date(clientData.whenIdentityChecksCompleted!);
        const typeOfTheDocumentCheck = clientData.howIdentityDocsChecked!;
        const errorArray = documentDetailsService.errorListDisplay(errorList.array(), formattedDocumentsChecked, lang, whenIdentityChecksCompleted, typeOfTheDocumentCheck);
        if (errorArray.length) {
            const pageProperties = getPageProperties(formatValidationError(errorArray, lang));
            res.status(400).render(config.ID_DOCUMENT_DETAILS, {
                previousPage: addLangToUrl(getBackUrl(clientData.howIdentityDocsChecked!), lang),
                ...getLocaleInfo(locales, lang),
                pageProperties: pageProperties,
                payload: req.body,
                currentUrl,
                documentsChecked: formattedDocumentsChecked,
                hintText: formattedHintText,
                countryList: countryList
            });
        } else {
            documentDetailsService.saveIdDocumentDetails(req, clientData, clientData.documentsChecked!);
            const checkYourAnswersFlag = session?.getExtraData(CHECK_YOUR_ANSWERS_FLAG);

            if (checkYourAnswersFlag) {
                res.redirect(addLangToUrl(BASE_URL + CHECK_YOUR_ANSWERS, lang));
            } else {
                res.redirect(addLangToUrl(BASE_URL + CONFIRM_IDENTITY_VERIFICATION, lang));
            }
        }
    } catch (error) {
        next(error);
    }
};

const getBackUrl = (selectedOption: string) => {
    if (selectedOption === CRYPTOGRAPHIC_SECURITY_FEATURES) {
        return BASE_URL + WHICH_IDENTITY_DOCS_CHECKED_GROUP1;
    } else {
        return BASE_URL + WHICH_IDENTITY_DOCS_CHECKED_GROUP2;
    }
};

export const createPayload = (idDocumentDetails: DocumentDetails[], formatDocumentsCheckedText: string[], i18n: any): { [key: string]: string | undefined } => {
    const payload: { [key: string]: any | undefined } = {};
    idDocumentDetails.forEach((body, index) => {
        for (let i = 0; i < formatDocumentsCheckedText.length; i++) {
            if (formatDocumentsCheckedText[i] === i18n[body.docName]) {
                payload[`documentNumber_${i + 1}`] = body.documentNumber;
                if (body.expiryDate) {
                    payload[`expiryDateDay_${i + 1}`] = body.expiryDate.getDate();
                    payload[`expiryDateMonth_${i + 1}`] = body.expiryDate.getMonth() + 1;
                    payload[`expiryDateYear_${i + 1}`] = body.expiryDate.getFullYear();
                } else {
                    payload[`expiryDateDay_${i + 1}`] = undefined;
                    payload[`expiryDateMonth_${i + 1}`] = undefined;
                    payload[`expiryDateYear_${i + 1}`] = undefined;
                }
                payload[`countryInput_${i + 1}`] = body.countryOfIssue;
            }
        }
    });
    return payload;
};
