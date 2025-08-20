import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { validationResult } from "express-validator";
import { formatValidationError, getPageProperties } from "../validations/validation";
import { BASE_URL, PERSONS_NAME, CHECK_YOUR_ANSWERS, USE_NAME_ON_PUBLIC_REGISTER } from "../types/pageURL";
import { Session } from "@companieshouse/node-session-handler";
import { USER_DATA, PREVIOUS_PAGE_URL } from "../utils/constants";
import { selectLang, addLangToUrl, getLocalesService, getLocaleInfo } from "../utils/localise";
import { saveDataInSession } from "../utils/sessionHelper";
import { ClientData } from "../model/ClientData";
import { getPreviousPageUrl, UrlData, getRedirectUrl } from "../services/url";
import { PersonsNameService } from "../services/personsNameService";

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

        const previousPageUrl = getPreviousPageUrl(req, BASE_URL);
        saveDataInSession(req, PREVIOUS_PAGE_URL, previousPageUrl);

        const previousPage = previousPageUrl === addLangToUrl(BASE_URL + CHECK_YOUR_ANSWERS, lang)
            ? addLangToUrl(BASE_URL + CHECK_YOUR_ANSWERS, lang)
            : addLangToUrl(BASE_URL, lang);

        res.render(config.PERSONS_NAME, {
            previousPage: previousPage,
            ...getLocaleInfo(locales, lang),
            currentUrl: BASE_URL + PERSONS_NAME,
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
            const session: Session = req.session as any as Session;
            const previousPageUrl: string = session?.getExtraData(PREVIOUS_PAGE_URL)!;

            const previousPage = previousPageUrl === addLangToUrl(BASE_URL + CHECK_YOUR_ANSWERS, lang)
                ? addLangToUrl(BASE_URL + CHECK_YOUR_ANSWERS, lang)
                : addLangToUrl(BASE_URL, lang);

            res.status(400).render(config.PERSONS_NAME, {
                ...getLocaleInfo(locales, lang),
                previousPage: previousPage,
                currentUrl: BASE_URL + PERSONS_NAME,
                payload: req.body,
                ...pageProperties
            });
        } else {
            PersonsNameService.savePersonsNameData(req);
            const serviceConfig: UrlData = {
                baseUrl: BASE_URL,
                checkYourAnswersUrl: CHECK_YOUR_ANSWERS,
                nextPageUrl: USE_NAME_ON_PUBLIC_REGISTER
            };
            const redirectUrl = getRedirectUrl(req, serviceConfig);
            res.redirect(redirectUrl);
        }
    } catch (error) {
        next(error);
    }
};
