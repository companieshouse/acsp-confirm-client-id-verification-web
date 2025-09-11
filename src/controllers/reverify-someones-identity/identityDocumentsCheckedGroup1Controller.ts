import { Session } from "@companieshouse/node-session-handler";
import * as config from "../../config";
import { NextFunction, Request, Response } from "express";
import { REVERIFY_BASE_URL, REVERIFY_WHICH_IDENTITY_DOCS_CHECKED_GROUP1, REVERIFY_HOW_IDENTITY_DOCUMENTS_CHECKED, REVERIFY_ID_DOCUMENT_DETAILS } from "../../types/pageURL";
import { addLangToUrl, getLocaleInfo, getLocalesService, selectLang } from "../../utils/localise";
import { CheckedDocumentsService } from "../../services/checkedDocumentsService";
import { ClientData } from "../../model/ClientData";
import { formatValidationError, getPageProperties } from "../../validations/validation";
import { USER_DATA } from "../../utils/constants";
import { validationResult } from "express-validator";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const session: Session = req.session as any as Session;
        const previousPage: string = addLangToUrl(REVERIFY_BASE_URL + REVERIFY_HOW_IDENTITY_DOCUMENTS_CHECKED, lang);
        const currentUrl: string = REVERIFY_BASE_URL + REVERIFY_WHICH_IDENTITY_DOCS_CHECKED_GROUP1;
        const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};
        const payload = { documentsGroup1: clientData.documentsChecked };

        res.render(config.IDENTITY_DOCUMETS_GROUP_1, {
            ...getLocaleInfo(locales, lang),
            previousPage,
            currentUrl,
            firstName: clientData?.firstName,
            lastName: clientData?.lastName,
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
        const previousPage: string = addLangToUrl(REVERIFY_BASE_URL + REVERIFY_HOW_IDENTITY_DOCUMENTS_CHECKED, lang);
        const currentUrl: string = REVERIFY_BASE_URL + REVERIFY_WHICH_IDENTITY_DOCS_CHECKED_GROUP1;
        const clientData: ClientData = session?.getExtraData(USER_DATA)!;
        const errorList = validationResult(req);

        if (!errorList.isEmpty()) {
            const pageProperties = getPageProperties(formatValidationError(errorList.array(), lang));
            res.status(400).render(config.IDENTITY_DOCUMETS_GROUP_1, {
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
            checkedDocumentsService.saveDocuments(req, clientData, req.body.documentsGroup1);

            res.redirect(addLangToUrl(REVERIFY_BASE_URL + REVERIFY_ID_DOCUMENT_DETAILS, lang));
        }
    } catch (error) {
        next(error);
    }
};
