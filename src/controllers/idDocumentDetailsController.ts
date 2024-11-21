import { Session } from "@companieshouse/node-session-handler";
import { NextFunction, Request, Response } from "express";
import countryList from "../lib/countryList";
import * as config from "../config";
import { BASE_URL, CONFIRM_IDENTITY_VERIFICATION, ID_DOCUMENT_DETAILS, WHICH_IDENTITY_DOCS_CHECKED_GROUP1, WHICH_IDENTITY_DOCS_CHECKED_GROUP2 } from "../types/pageURL";
import { ClientData } from "../model/ClientData";
import { USER_DATA } from "../utils/constants";
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
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const session: Session = req.session as any as Session;
    const clientData: ClientData = session?.getExtraData(USER_DATA)!;
    console.log("client data----->", clientData);
    const formattedDocumentsChecked = FormatService.formatDocumentsCheckedText(
        clientData.documentsChecked,
        clientData.howIdentityDocsChecked,
        locales.i18nCh.resolveNamespacesKeys(lang)
    );
    console.log("formattedDocumentsChecked----->", formattedDocumentsChecked);
    let payload;
    if (clientData.idDocumentDetails != null) {
        payload = createPayload(clientData.idDocumentDetails, formattedDocumentsChecked);
    }

    res.render(config.ID_DOCUMENT_DETAILS, {
        previousPage: addLangToUrl(getBackUrl(clientData.howIdentityDocsChecked!), lang),
        ...getLocaleInfo(locales, lang),
        // matomoLinkClick: MATOMO_LINK_CLICK,
        // matomoButtonClick: MATOMO_BUTTON_CLICK,
        currentUrl: BASE_URL + ID_DOCUMENT_DETAILS,
        documentsChecked: formattedDocumentsChecked,
        countryList: countryList,
        payload
    });
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const session: Session = req.session as any as Session;
    const currentUrl: string = BASE_URL + ID_DOCUMENT_DETAILS;
    const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};

    const errorList = validationResult(req);
    const formattedDocumentsChecked = FormatService.formatDocumentsCheckedText(
        clientData.documentsChecked,
        clientData.howIdentityDocsChecked,
        locales.i18nCh.resolveNamespacesKeys(lang)
    );

    const documentDetailsService = new IdDocumentDetailsService();
    const errorArray = documentDetailsService.errorListDisplay(errorList.array(), formattedDocumentsChecked, lang, clientData.whenIdentityChecksCompleted!);
    if (errorArray.length) {
        const pageProperties = getPageProperties(formatValidationError(errorArray, lang));
        res.status(400).render(config.ID_DOCUMENT_DETAILS, {
            previousPage: addLangToUrl(getBackUrl(clientData.howIdentityDocsChecked!), lang),
            ...getLocaleInfo(locales, lang),
            pageProperties: pageProperties,
            payload: req.body,
            currentUrl,
            documentsChecked: formattedDocumentsChecked,
            countryList: countryList
        });
    } else {
        documentDetailsService.saveIdDocumentDetails(req, clientData, formattedDocumentsChecked);
        res.redirect(addLangToUrl(BASE_URL + CONFIRM_IDENTITY_VERIFICATION, lang));
    }
};

const getBackUrl = (selectedOption: string) => {
    if (selectedOption === "cryptographic_security_features_checked") {
        return BASE_URL + WHICH_IDENTITY_DOCS_CHECKED_GROUP1;
    } else {
        return BASE_URL + WHICH_IDENTITY_DOCS_CHECKED_GROUP2;
    }
};

const createPayload = (idDocumentDetails: DocumentDetails[], formatDocumentsCheckedText: string[]): { [key: string]: string | undefined } => {
    const payload: { [key: string]: any | undefined } = {};
    idDocumentDetails.forEach((body, index) => {
        for (let i = 0; i < formatDocumentsCheckedText.length; i++) {
            if (formatDocumentsCheckedText[i] === body.docName) {
                payload[`documentNumber_${i + 1}`] = body.documentNumber;
                payload[`expiryDateDay_${i + 1}`] = body.expiryDate!.getDate();
                payload[`expiryDateMonth_${i + 1}`] = body.expiryDate!.getMonth() + 1;
                payload[`expiryDateYear_${i + 1}`] = body.expiryDate!.getFullYear();
                payload[`countryInput_${i + 1}`] = body.countryOfIssue;
            }
        }
    });
    return payload;
};
