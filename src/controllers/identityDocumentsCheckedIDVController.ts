import { Session } from "@companieshouse/node-session-handler";
import * as config from "../config";
import { NextFunction, Request, Response } from "express";
import { BASE_URL, IDENTITY_DOCUMETS_IDV, IDENTITY_DOCUMETS_CHECKED, CONFIRM_IDENTITY_VERIFICATION } from "../types/pageURL";
import { addLangToUrl, getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";
import { ClientData } from "../model/ClientData";
import { USER_DATA } from "../utils/constants";
import { validationResult } from "express-validator";
import { formatValidationError, getPageProperties } from "../validations/validation";
import { CheckedDocumentsService } from "../services/checkedDocumentsService";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const session: Session = req.session as any as Session;
    const previousPage: string = addLangToUrl(BASE_URL + IDENTITY_DOCUMETS_CHECKED, lang);
    const currentUrl: string = BASE_URL + IDENTITY_DOCUMETS_IDV;
    const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};

    const payload = { documents: clientData.documentsChecked };

    res.render(config.IDENTITY_DOCUMETS_IDV, {
        ...getLocaleInfo(locales, lang),
        previousPage,
        currentUrl,
        firstName: clientData?.firstName,
        lastName: clientData?.lastName,
        payload
    });
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const session: Session = req.session as any as Session;
    const previousPage: string = addLangToUrl(BASE_URL + IDENTITY_DOCUMETS_CHECKED, lang);
    const currentUrl: string = BASE_URL + IDENTITY_DOCUMETS_IDV;
    const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};
    const errorList = validationResult(req);

    if (!errorList.isEmpty()) {
        const pageProperties = getPageProperties(formatValidationError(errorList.array(), lang));
        res.status(400).render(config.IDENTITY_DOCUMETS_IDV, {
            ...getLocaleInfo(locales, lang),
            ...pageProperties,
            previousPage,
            currentUrl,
            payload: req.body,
            firstName: clientData?.firstName,
            lastName: clientData?.lastName
        });
    } else {
        const checkedDocumentsService = new CheckedDocumentsService();
        checkedDocumentsService.saveDocumentsToSession(req, req.body.documents);
        res.redirect(addLangToUrl(BASE_URL + CONFIRM_IDENTITY_VERIFICATION, lang));
    }
};
