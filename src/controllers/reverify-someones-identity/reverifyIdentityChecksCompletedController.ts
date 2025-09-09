import { NextFunction, Request, Response } from "express";
import * as config from "../../config";
import { validationResult } from "express-validator";
import { formatValidationError, getPageProperties } from "../../validations/validation";
import { REVERIFY_BASE_URL, REVERIFY_CHECK_YOUR_ANSWERS, REVERIFY_CONFIRM_HOME_ADDRESS, REVERIFY_WHEN_IDENTITY_CHECKS_COMPLETED, REVERIFY_HOW_IDENTITY_DOCUMENTS_CHECKED } from "../../types/pageURL";
import { selectLang, addLangToUrl, getLocalesService, getLocaleInfo } from "../../utils/localise";
import { Session } from "@companieshouse/node-session-handler";
import { PREVIOUS_PAGE_URL, USER_DATA } from "../../utils/constants";
import { ClientData } from "model/ClientData";
import { saveDataInSession } from "../../utils/sessionHelper";
import { getPreviousPageUrl } from "../../services/url";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const session: Session = req.session as any as Session;

        const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};

        let payload;
        if (clientData?.whenIdentityChecksCompleted) {
            const whenIdentityChecksCompleted = new Date(clientData.whenIdentityChecksCompleted);
            payload = {
                "wicc-year": whenIdentityChecksCompleted.getFullYear(),
                "wicc-month": whenIdentityChecksCompleted.getMonth() + 1,
                "wicc-day": whenIdentityChecksCompleted.getDate()
            };
        }
        const previousPageUrl = getPreviousPageUrl(req, REVERIFY_BASE_URL);
        saveDataInSession(req, PREVIOUS_PAGE_URL, previousPageUrl);

        const previousPage = previousPageUrl === addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang)
            ? addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang)
            : addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CONFIRM_HOME_ADDRESS, lang);

        res.render(config.WHEN_IDENTITY_CHECKS_COMPLETED, {
            ...getLocaleInfo(locales, lang),
            previousPage: previousPage,
            currentUrl: REVERIFY_BASE_URL + REVERIFY_WHEN_IDENTITY_CHECKS_COMPLETED,
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
        const previousPageUrl: string = session?.getExtraData(PREVIOUS_PAGE_URL)!;

        const previousPage = previousPageUrl === addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang)
            ? addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang)
            : addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CONFIRM_HOME_ADDRESS, lang);

        const clientData: ClientData = session?.getExtraData(USER_DATA)!;
        const errorList = validationResult(req);
        if (!errorList.isEmpty()) {
            const pageProperties = getPageProperties(formatValidationError(errorList.array(), lang));
            res.status(400).render(config.WHEN_IDENTITY_CHECKS_COMPLETED, {
                ...getLocaleInfo(locales, lang),
                previousPage: previousPage,
                currentUrl: REVERIFY_BASE_URL + REVERIFY_WHEN_IDENTITY_CHECKS_COMPLETED,
                pageProperties: pageProperties,
                payload: req.body,
                firstName: clientData?.firstName,
                lastName: clientData?.lastName
            });
        } else {
            if (clientData) {
                const whenIdentityChecksCompleted = new Date(
                    req.body["wicc-year"],
                    req.body["wicc-month"] - 1,
                    req.body["wicc-day"]
                );
                clientData.whenIdentityChecksCompleted = whenIdentityChecksCompleted.toISOString();
            }
            saveDataInSession(req, USER_DATA, clientData);

            if (previousPageUrl === addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang)) {
                res.redirect(addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang));
            } else {
                res.redirect(addLangToUrl(REVERIFY_BASE_URL + REVERIFY_HOW_IDENTITY_DOCUMENTS_CHECKED, lang));
            }
        }
    } catch (error) {
        next(error);
    }

};
