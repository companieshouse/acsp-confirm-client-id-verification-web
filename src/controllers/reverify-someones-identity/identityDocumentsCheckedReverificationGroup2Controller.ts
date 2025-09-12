
import { Session } from "@companieshouse/node-session-handler";
import * as config from "../../config";
import { NextFunction, Request, Response } from "express";
import {
    HOW_IDENTITY_DOCUMENTS_CHECKED,
    REVERIFY_HOW_IDENTITY_DOCUMENTS_CHECKED,
    REVERIFY_BASE_URL,
    REVERIFY_IDENTITY_DOCUMENTS_CHECKED_GROUP2,
    REVERIFY_ENTER_ID_DOCUMENT_DETAILS
} from "../../types/pageURL";
import { addLangToUrl, getLocaleInfo, getLocalesService, selectLang } from "../../utils/localise";
import { ClientData } from "../../model/ClientData";
import { USER_DATA } from "../../utils/constants";
import { validationResult } from "express-validator";
import { formatValidationError, getPageProperties } from "../../validations/validation";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const session: Session = req.session as any as Session;
        const previousPage: string = addLangToUrl(REVERIFY_BASE_URL + REVERIFY_HOW_IDENTITY_DOCUMENTS_CHECKED, lang);
        const currentUrl: string = REVERIFY_BASE_URL + REVERIFY_IDENTITY_DOCUMENTS_CHECKED_GROUP2;
        const clientData: ClientData = session?.getExtraData(USER_DATA)!;

        res.render(config.IDENTITY_DOCUMETS_GROUP_2, {
            ...getLocaleInfo(locales, lang),
            previousPage,
            currentUrl,
            firstName: clientData?.firstName,
            lastName: clientData?.lastName
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
        const previousPage: string = addLangToUrl(REVERIFY_BASE_URL + HOW_IDENTITY_DOCUMENTS_CHECKED, lang);
        const currentUrl: string = REVERIFY_BASE_URL + REVERIFY_IDENTITY_DOCUMENTS_CHECKED_GROUP2;
        const errorList = validationResult(req);
        const clientData: ClientData = session?.getExtraData(USER_DATA)!;

        if (!errorList.isEmpty()) {
            const pageProperties = getPageProperties(formatValidationError(errorList.array(), lang));
            res.status(400).render(config.IDENTITY_DOCUMETS_GROUP_2, {
                ...getLocaleInfo(locales, lang),
                ...pageProperties,
                previousPage,
                payload: req.body,
                firstName: clientData?.firstName,
                lastName: clientData?.lastName,
                currentUrl
            });
        } else {
            res.redirect(addLangToUrl(REVERIFY_BASE_URL + REVERIFY_ENTER_ID_DOCUMENT_DETAILS, lang));
        }
    } catch (error) {
        next(error);
    }
};
