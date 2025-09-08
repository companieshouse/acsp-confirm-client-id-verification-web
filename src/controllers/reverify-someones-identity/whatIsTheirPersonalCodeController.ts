/* eslint-disable indent */
import { NextFunction, Request, Response } from "express";
import * as config from "../../config";
import {
    REVERIFY_DATE_OF_BIRTH,
    REVERIFY_BASE_URL,
    REVERIFY_CHECK_YOUR_ANSWERS,
    REVERIFY_PERSONAL_CODE,
    REVERIFY_EMAIL_ADDRESS
} from "../../types/pageURL";
import { addLangToUrl, getLocaleInfo, getLocalesService, selectLang } from "../../utils/localise";
import { getPreviousPageUrl } from "../../services/url";
import { saveDataInSession } from "../../utils/sessionHelper";
import { formatValidationError, getPageProperties } from "../../validations/validation";
import { validationResult } from "express-validator";
import { PREVIOUS_PAGE_URL } from "../../utils/constants";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();

        const previousPageUrl = getPreviousPageUrl(req, REVERIFY_BASE_URL);
        saveDataInSession(req, PREVIOUS_PAGE_URL, previousPageUrl);

        const previousPage = previousPageUrl === addLangToUrl(REVERIFY_BASE_URL, lang)
            ? addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang)
            : addLangToUrl(REVERIFY_BASE_URL, lang);

        res.render(config.REVERIFY_PERSONAL_CODE, {
            ...getLocaleInfo(locales, lang),
            previousPage: previousPage,
            currentUrl: REVERIFY_BASE_URL + REVERIFY_PERSONAL_CODE
        });
    } catch (error) {
        next(error);
    }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const errorList = validationResult(req);
        const currentUrl = REVERIFY_BASE_URL + REVERIFY_PERSONAL_CODE;
        const previousPageUrl = getPreviousPageUrl(req, REVERIFY_DATE_OF_BIRTH);

        saveDataInSession(req, PREVIOUS_PAGE_URL, previousPageUrl);

        const previousPage = previousPageUrl === addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang)
            ? addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang)
            : addLangToUrl(REVERIFY_BASE_URL + REVERIFY_DATE_OF_BIRTH, lang);

        if (errorList.isEmpty()) {
            res.redirect(addLangToUrl(REVERIFY_BASE_URL + REVERIFY_EMAIL_ADDRESS, lang));
        } else {
            const pageProperties = getPageProperties(formatValidationError(errorList.array(), lang));
            res.status(400).render(config.REVERIFY_PERSONAL_CODE, {
                ...getLocaleInfo(locales, lang),
                previousPage,
                currentUrl,
                payload: req.body,
                ...pageProperties
            });
        }
    } catch (error) {
        next(error);
    }
};
