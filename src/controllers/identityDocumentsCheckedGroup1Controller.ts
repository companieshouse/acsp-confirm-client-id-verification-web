import { Session } from "@companieshouse/node-session-handler";
import * as config from "../config";
import { NextFunction, Request, Response } from "express";
import { BASE_URL, WHICH_IDENTITY_DOCS_CHECKED_GROUP1, HOW_IDENTITY_DOCUMENTS_CHECKED, CONFIRM_IDENTITY_VERIFICATION, CHECK_YOUR_ANSWERS, ID_DOCUMENT_DETAILS } from "../types/pageURL";
import { addLangToUrl, getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";
import { CheckedDocumentsService } from "../services/checkedDocumentsService";
import { ClientData } from "../model/ClientData";
import { formatValidationError, getPageProperties } from "../validations/validation";
import { USER_DATA, MATOMO_BUTTON_CLICK, MATOMO_RADIO_OPTION_SELECT, CHECK_YOUR_ANSWERS_FLAG } from "../utils/constants";
import { validationResult } from "express-validator";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const session: Session = req.session as any as Session;
    const previousPage: string = addLangToUrl(BASE_URL + HOW_IDENTITY_DOCUMENTS_CHECKED, lang);
    const currentUrl: string = BASE_URL + WHICH_IDENTITY_DOCS_CHECKED_GROUP1;
    const clientData: ClientData = session?.getExtraData(USER_DATA)!;

    const payload = { documentsGroup1: clientData.documentsChecked };

    res.render(config.IDENTITY_DOCUMETS_GROUP_1, {
        ...getLocaleInfo(locales, lang),
        previousPage,
        currentUrl,
        matomoButtonClick: MATOMO_BUTTON_CLICK,
        matomoRadioSelection: MATOMO_RADIO_OPTION_SELECT,
        firstName: clientData?.firstName,
        lastName: clientData?.lastName,
        payload
    });
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const session: Session = req.session as any as Session;
    const previousPage: string = addLangToUrl(BASE_URL + HOW_IDENTITY_DOCUMENTS_CHECKED, lang);
    const currentUrl: string = BASE_URL + WHICH_IDENTITY_DOCS_CHECKED_GROUP1;
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
        const checkYourAnswersFlag = session?.getExtraData(CHECK_YOUR_ANSWERS_FLAG);

        if (checkYourAnswersFlag) {
            res.redirect(addLangToUrl(BASE_URL + CHECK_YOUR_ANSWERS, lang));
        } else {
            res.redirect(addLangToUrl(BASE_URL + CONFIRM_IDENTITY_VERIFICATION, lang));
            // res.redirect(addLangToUrl(BASE_URL + ID_DOCUMENT_DETAILS, lang));
        }
    }
};
