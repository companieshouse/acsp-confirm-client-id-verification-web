import { NextFunction, Request, Response } from "express";
import { selectLang, addLangToUrl, getLocalesService, getLocaleInfo } from "../../utils/localise";
import { Session } from "@companieshouse/node-session-handler";
import * as config from "../../config";
import { REVERIFY_BASE_URL, REVERIFY_CHECK_YOUR_ANSWERS, REVERIFY_PERSONS_NAME, REVERIFY_SHOW_ON_PUBLIC_REGISTER } from "../../types/pageURL";
import { PREVIOUS_PAGE_URL, USER_DATA } from "../../utils/constants";
import { ClientData } from "../../model/ClientData";
import { saveDataInSession } from "../../utils/sessionHelper";
import { getPreviousPageUrl } from "../../services/url";
import { validationResult } from "express-validator";
import { formatValidationError, getPageProperties } from "../../validations/validation";

export const get = (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const session: Session = req.session as any as Session;
        const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};
        const payload = {
            "first-name": clientData.firstName,
            "middle-names": clientData.middleName,
            "last-name": clientData.lastName
        };

        // TODO: Use the REVERIFY_BASE_URL for now as development is ongoing for other pages within this service - this will be replaced with the email address view
        const previousPageUrl = getPreviousPageUrl(req, REVERIFY_BASE_URL);
        saveDataInSession(req, PREVIOUS_PAGE_URL, previousPageUrl);

        const previousPage = previousPageUrl === addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang)
            ? addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang)
            : addLangToUrl(REVERIFY_BASE_URL, lang);

        res.render(config.PERSONS_NAME, {
            ...getLocaleInfo(locales, lang),
            previousPage: previousPage,
            currentUrl: REVERIFY_BASE_URL + REVERIFY_PERSONS_NAME,
            payload
        });
    } catch (error) {
        next(error);
    }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const errorList = validationResult(req);
        if (!errorList.isEmpty()) {
            const pageProperties = getPageProperties(formatValidationError(errorList.array(), lang));
            // Use the REVERIFY_BASE_URL for now as development is ongoing for other pages within this service - this will be replaced with the email address view
            const previousPage = addLangToUrl(REVERIFY_BASE_URL, lang);

            res.status(400).render(config.PERSONS_NAME, {
                ...getLocaleInfo(locales, lang),
                previousPage: previousPage,
                currentUrl: REVERIFY_BASE_URL + REVERIFY_PERSONS_NAME,
                payload: req.body,
                ...pageProperties
            });
        } else {
            const session: Session = req.session as any as Session;
            const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};

            clientData.firstName = req.body["first-name"];
            clientData.middleName = req.body["middle-names"];
            clientData.lastName = req.body["last-name"];

            saveDataInSession(req, USER_DATA, clientData);

            const previousPageUrl: string = session?.getExtraData(PREVIOUS_PAGE_URL)!;

            if (previousPageUrl === addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang)) {
                res.redirect(addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang));
            } else {
                res.redirect(addLangToUrl(REVERIFY_BASE_URL + REVERIFY_SHOW_ON_PUBLIC_REGISTER, lang));
            }
        }
    } catch (error) {
        next(error);
    }
};
