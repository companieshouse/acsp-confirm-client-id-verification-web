import { NextFunction, Request, Response } from "express";
import { selectLang, addLangToUrl, getLocalesService, getLocaleInfo } from "../../utils/localise";
import { Session } from "@companieshouse/node-session-handler";
import * as config from "../../config";
import { REVERIFY_BASE_URL, REVERIFY_CHECK_YOUR_ANSWERS, REVERIFY_PERSONS_EMAIL_ADDRESS, REVERIFY_PERSONS_NAME, REVERIFY_SHOW_ON_PUBLIC_REGISTER } from "../../types/pageURL";
import { PREVIOUS_PAGE_URL, USER_DATA } from "../../utils/constants";
import { ClientData } from "../../model/ClientData";
import { saveDataInSession } from "../../utils/sessionHelper";
import { getPreviousPageUrl, UrlData, getRedirectUrl } from "../../services/url";
import { validationResult } from "express-validator";
import { formatValidationError, getPageProperties } from "../../validations/validation";
import { PersonsNameService } from "../../services/personsNameService";

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

        const previousPageUrl = getPreviousPageUrl(req, REVERIFY_BASE_URL);
        saveDataInSession(req, PREVIOUS_PAGE_URL, previousPageUrl);

        const previousPage = previousPageUrl === addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang)
            ? addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang)
            : addLangToUrl(REVERIFY_BASE_URL + REVERIFY_PERSONS_EMAIL_ADDRESS, lang);

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
            const previousPage = addLangToUrl(REVERIFY_BASE_URL, lang);

            res.status(400).render(config.PERSONS_NAME, {
                ...getLocaleInfo(locales, lang),
                previousPage: previousPage,
                currentUrl: REVERIFY_BASE_URL + REVERIFY_PERSONS_NAME,
                payload: req.body,
                ...pageProperties
            });
        } else {
            PersonsNameService.savePersonsNameData(req);
            const serviceConfig: UrlData = {
                baseUrl: REVERIFY_BASE_URL,
                checkYourAnswersUrl: REVERIFY_CHECK_YOUR_ANSWERS,
                nextPageUrl: REVERIFY_SHOW_ON_PUBLIC_REGISTER
            };
            const redirectUrl = getRedirectUrl(req, serviceConfig);
            res.redirect(redirectUrl);
        }
    } catch (error) {
        next(error);
    }
};
