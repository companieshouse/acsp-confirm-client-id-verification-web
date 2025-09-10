/* eslint-disable indent */
import { NextFunction, Request, Response } from "express";
import * as config from "../../config";
import {
    REVERIFY_DATE_OF_BIRTH,
    REVERIFY_BASE_URL,
    REVERIFY_PERSONAL_CODE,
    REVERIFY_EMAIL_ADDRESS,
    REVERIFY_PERSONAL_CODE_IS_INVALID
} from "../../types/pageURL";
import { addLangToUrl, getLocaleInfo, getLocalesService, selectLang } from "../../utils/localise";
import { getPreviousPageUrl } from "../../services/url";
import { saveDataInSession } from "../../utils/sessionHelper";
import { formatValidationError, getPageProperties } from "../../validations/validation";
import { validationResult } from "express-validator";
import { PREVIOUS_PAGE_URL } from "../../utils/constants";
import { findIdentityByUvid } from "../../services/identityVerificationService";
import { ErrorService } from "../../services/errorService";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();

        const previousPageUrl = getPreviousPageUrl(req, REVERIFY_BASE_URL);
        saveDataInSession(req, PREVIOUS_PAGE_URL, previousPageUrl);
        const previousPage = addLangToUrl(REVERIFY_BASE_URL, lang);
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
        const previousPage = addLangToUrl(REVERIFY_BASE_URL, lang);

        if (errorList.isEmpty()) {
            await findIdentityByUvid(req.body.personalCode).then(identity => {
                if (identity === undefined || identity.status !== "valid_pending_reverification") {
                    res.redirect(addLangToUrl(REVERIFY_BASE_URL + REVERIFY_PERSONAL_CODE_IS_INVALID, lang));
                } else {
                    res.redirect(addLangToUrl(REVERIFY_BASE_URL + REVERIFY_EMAIL_ADDRESS, lang));
                }
            }).catch(() => {
                const errorService = new ErrorService();
                errorService.renderErrorPage(res, locales, lang, currentUrl);
            });
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
