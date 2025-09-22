/* eslint-disable indent */
import { NextFunction, Request, Response } from "express";
import * as config from "../../config";
import {
    REVERIFY_BASE_URL,
    REVERIFY_PERSONAL_CODE,
    REVERIFY_CHECK_YOUR_ANSWERS,
    REVERIFY_PERSONS_EMAIL_ADDRESS,
    REVERIFY_PERSONAL_CODE_IS_INVALID
} from "../../types/pageURL";
import { addLangToUrl, getLocaleInfo, getLocalesService, selectLang } from "../../utils/localise";
import { getPreviousPageUrl } from "../../services/url";
import { Session } from "@companieshouse/node-session-handler";
import { saveDataInSession } from "../../utils/sessionHelper";
import { formatValidationError, getPageProperties } from "../../validations/validation";
import { validationResult } from "express-validator";
import { CHECK_YOUR_ANSWERS_FLAG, PREVIOUS_PAGE_URL, REVERIFY_IDENTITY, USER_DATA } from "../../utils/constants";
import { findIdentityByUvid } from "../../services/identityVerificationService";
import { ClientData } from "../../model/ClientData";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const session: Session = req.session as any as Session;
        const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};
        const payload = { personalCode: clientData?.personalCode };

        const previousPageUrl = getPreviousPageUrl(req, REVERIFY_BASE_URL);
        saveDataInSession(req, PREVIOUS_PAGE_URL, previousPageUrl);

        const previousPage = previousPageUrl === addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang)
            ? addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang)
            : addLangToUrl(REVERIFY_BASE_URL, lang);

        res.render(config.REVERIFY_PERSONAL_CODE, {
            ...getLocaleInfo(locales, lang),
            previousPage: previousPage,
            currentUrl: REVERIFY_BASE_URL + REVERIFY_PERSONAL_CODE,
            payload
        });
    } catch (error) {
        next(error);
    }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const lang = selectLang(req.query.lang);
        const session: Session = req.session as any as Session;
        const locales = getLocalesService();
        const errorList = validationResult(req);
        const currentUrl = REVERIFY_BASE_URL + REVERIFY_PERSONAL_CODE;
        const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};

        const previousPageUrl = getPreviousPageUrl(req, REVERIFY_BASE_URL);
        saveDataInSession(req, PREVIOUS_PAGE_URL, previousPageUrl);

        const previousPage = previousPageUrl === addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang)
            ? addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang)
            : addLangToUrl(REVERIFY_BASE_URL, lang);

        if (errorList.isEmpty()) {
            await findIdentityByUvid(req.body.personalCode).then(identity => {
                if (identity === undefined || identity.status !== "valid_pending_reverification") {
                    res.redirect(addLangToUrl(REVERIFY_BASE_URL + REVERIFY_PERSONAL_CODE_IS_INVALID, lang));
                } else {
                    session.setExtraData(REVERIFY_IDENTITY, identity);
                    clientData.personalCode = req.body.personalCode;
                    saveDataInSession(req, USER_DATA, clientData);

                    const checkYourAnswersFlag = session?.getExtraData(CHECK_YOUR_ANSWERS_FLAG);

                    if (checkYourAnswersFlag) {
                        res.redirect(addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang));
                    } else {
                        res.redirect(addLangToUrl(REVERIFY_BASE_URL + REVERIFY_PERSONS_EMAIL_ADDRESS, lang));
                    }
                }
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
