import { Session } from "@companieshouse/node-session-handler";
import { NextFunction, Request, Response } from "express";
import countryList from "../lib/countryList";
import * as config from "../config";
import { BASE_URL, CONFIRM_IDENTITY_VERIFICATION, ID_DOCUMENT_DETAILS, PERSONS_NAME, WHICH_IDENTITY_DOCS_CHECKED_GROUP1, WHICH_IDENTITY_DOCS_CHECKED_GROUP2 } from "../types/pageURL";
import { ClientData } from "../model/ClientData";
import { MATOMO_LINK_CLICK, MATOMO_BUTTON_CLICK, USER_DATA } from "../utils/constants";
import { formatValidationError, getPageProperties, resolveErrorMessage } from "../validations/validation";
import { validationResult } from "express-validator";
import {
    addLangToUrl,
    getLocaleInfo,
    getLocalesService,
    selectLang
} from "../utils/localise";
import { FormatService } from "../services/formatService";
import { idDocumentDetailsService } from "../services/idDocumentDetailsService";
import { DocumentDetails } from "../model/DocumentDetails";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const session: Session = req.session as any as Session;
    const clientData: ClientData = session?.getExtraData(USER_DATA)!;

    const formattedDocumentsChecked = FormatService.formatDocumentsCheckedText(
        clientData.documentsChecked,
        locales.i18nCh.resolveNamespacesKeys(lang)
    );

    // console.log("reached a------>")
    // let payload;
    // if(clientData.idDocumentDetails){
    //     console.log("reached b------>")
    //     payload = createPayload(clientData.idDocumentDetails);
    // }

    res.render(config.ID_DOCUMENT_DETAILS, {
        previousPage: addLangToUrl(getBackUrl(clientData.howIdentityDocsChecked!), lang),
        ...getLocaleInfo(locales, lang),
        // matomoLinkClick: MATOMO_LINK_CLICK,
        // matomoButtonClick: MATOMO_BUTTON_CLICK,
        currentUrl: BASE_URL + ID_DOCUMENT_DETAILS,
        documentsChecked: formattedDocumentsChecked,
        countryList: countryList
    });
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const session: Session = req.session as any as Session;
    const currentUrl: string = BASE_URL + ID_DOCUMENT_DETAILS;
    const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};

    const errorList = validationResult(req);
    if (!errorList.isEmpty()) {
        errorListDisplay(errorList.array(), clientData.documentsChecked!, lang);
        const pageProperties = getPageProperties(formatValidationError(errorList.array(), lang));
        res.status(400).render(config.ID_DOCUMENT_DETAILS, {
            previousPage: addLangToUrl(getBackUrl(clientData.howIdentityDocsChecked!), lang),
            ...getLocaleInfo(locales, lang),
            ...pageProperties,
            payload: req.body,
            currentUrl,
            documentsChecked: clientData.documentsChecked,
            countryList: countryList
        });
    } else {
        // const documentDetailsService = new idDocumentDetailsService();
        // documentDetailsService.saveIdDocumentDetails(req, clientData, locales, lang);
        res.redirect(addLangToUrl(BASE_URL + CONFIRM_IDENTITY_VERIFICATION, lang));
    }
};

const errorListDisplay = (errors: any[], documentsChecked: string[], lang: string) => {
    return errors.forEach((element) => {
        const index = element.param.substr("documentDetials_".length) - 1;
        const selection = documentsChecked[index];
        element.msg = resolveErrorMessage(element.msg, lang);
        element.msg = element.msg + selection;
        return element;

    });
};

const getBackUrl = (selectedOption: string) => {
    if (selectedOption === "cryptographic_security_features_checked") {
        return BASE_URL + WHICH_IDENTITY_DOCS_CHECKED_GROUP1;
    } else {
        return BASE_URL + WHICH_IDENTITY_DOCS_CHECKED_GROUP2;
    }
};
const createPayload = (idDocumentDetails: DocumentDetails[]): { [key: string]: string | undefined } => {
    const payload: { [key: string]: any | undefined } = {};
    idDocumentDetails.forEach((body, index) => {

        payload[`documentNumber_${index + 1}`] = body.documentNumber;
        payload[`expiryDate_${index + 1}`] = body.expiryDate;
        payload[`countryInput_${index + 1}`] = body.countryOfIssue;
    });
    console.log("payload---->", JSON.stringify(payload));
    return payload;
};
