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

export const get = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const session: Session = req.session as any as Session;
    const clientData: ClientData = session?.getExtraData(USER_DATA)!;

    console.log("documents checked------>", JSON.stringify(clientData.documentsChecked));
    const formattedDocumentsChecked = FormatService.formatDocumentsCheckedText(
        clientData.documentsChecked,
        locales.i18nCh.resolveNamespacesKeys(lang)
    );

    console.log("values----->" + JSON.stringify(formattedDocumentsChecked));
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
        console.log("body----->", req.body);
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
    console.log("back----->", selectedOption);
    if (selectedOption === "cryptographic_security_features_checked") {
        return BASE_URL + WHICH_IDENTITY_DOCS_CHECKED_GROUP1;
    } else {
        return BASE_URL + WHICH_IDENTITY_DOCS_CHECKED_GROUP2;
    }
};
