import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { HOW_IDENTITY_DOCUMENTS_CHECKED, WHEN_IDENTITY_CHECKS_COMPLETED, WHICH_IDENTITY_DOCS_CHECKED_GROUP1, BASE_URL, WHICH_IDENTITY_DOCS_CHECKED_GROUP2 } from "../types/pageURL";
import { addLangToUrl, getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";
import { formatValidationError, getPageProperties } from "../validations/validation";
import { validationResult } from "express-validator";
import { Session } from "@companieshouse/node-session-handler";
import { ClientData } from "model/ClientData";
import { USER_DATA } from "../utils/constants";
import { saveDataInSession } from "../utils/sessionHelper";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const session: Session = req.session as any as Session;
    const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};

    res.render(config.HOW_IDENTITY_DOCUMENTS_CHECKED, {
        ...getLocaleInfo(locales, lang),
        previousPage: addLangToUrl(BASE_URL + WHEN_IDENTITY_CHECKS_COMPLETED, lang),
        currentUrl: BASE_URL + HOW_IDENTITY_DOCUMENTS_CHECKED,
        selectedOption: clientData.howIdentityDocsChecked,
        firstName: clientData.firstName,
        lastName: clientData.lastName
    });
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const session: Session = req.session as any as Session;
    const clientData: ClientData = session?.getExtraData(USER_DATA)!;
    const errorList = validationResult(req);
    if (!errorList.isEmpty()) {
        const pageProperties = getPageProperties(formatValidationError(errorList.array(), lang));
        res.status(400).render(config.HOW_IDENTITY_DOCUMENTS_CHECKED, {
            previousPage: addLangToUrl(BASE_URL + WHEN_IDENTITY_CHECKS_COMPLETED, lang),
            ...getLocaleInfo(locales, lang),
            currentUrl: BASE_URL + HOW_IDENTITY_DOCUMENTS_CHECKED,
            ...pageProperties,
            selectedOption: req.body,
            firstName: clientData?.firstName,
            lastName: clientData?.lastName
        });
    } else {
        const selectedOption = req.body.howIdentityDocsCheckedRadio;
        clientData.howIdentityDocsChecked = selectedOption;
        saveDataInSession(req, USER_DATA, clientData);
        if (selectedOption === "OPTION1") {
            res.redirect(addLangToUrl(BASE_URL + WHICH_IDENTITY_DOCS_CHECKED_GROUP1, lang));
        } else if (selectedOption === "OPTION2") {
            res.redirect(addLangToUrl(BASE_URL + WHICH_IDENTITY_DOCS_CHECKED_GROUP2, lang));
        }
    }
};
