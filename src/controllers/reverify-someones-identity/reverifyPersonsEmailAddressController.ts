import { NextFunction, Request, Response } from "express";
import * as config from "../../config";
import { REVERIFY_PERSONAL_CODE, REVERIFY_PERSONS_EMAIL_ADDRESS, PROVIDE_DIFFERENT_EMAIL, REVERIFY_CHECK_YOUR_ANSWERS, REVERIFY_BASE_URL, REVERIFY_PERSONS_NAME } from "../../types/pageURL";
import { addLangToUrl, getLocaleInfo, getLocalesService, selectLang } from "../../utils/localise";
import { formatValidationError, getPageProperties } from "../../validations/validation";
import { validationResult } from "express-validator";
import { Session } from "@companieshouse/node-session-handler";
import { ClientData } from "model/ClientData";
import { USER_DATA, PREVIOUS_PAGE_URL, REVERIFY_IDENTITY } from "../../utils/constants";
import { saveDataInSession } from "../../utils/sessionHelper";
import { LocalesService } from "@companieshouse/ch-node-utils";
import { getPreviousPageUrl } from "../../services/url";
import { Identity } from "private-api-sdk-node/dist/services/identity-verification/types";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const session: Session = req.session as any as Session;
        const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};

        const payload = {
            "email-address": clientData?.emailAddress,
            confirm: clientData?.confirmEmailAddress
        };

        const previousPageUrl = getPreviousPageUrl(req, REVERIFY_BASE_URL);
        saveDataInSession(req, PREVIOUS_PAGE_URL, previousPageUrl);

        const previousPage = previousPageUrl === addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang)
            ? addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang)
            : addLangToUrl(REVERIFY_BASE_URL + REVERIFY_PERSONAL_CODE, lang);

        res.render(config.PERSONS_EMAIL, {
            ...getLocaleInfo(locales, lang),
            previousPage: previousPage,
            currentUrl: REVERIFY_BASE_URL + REVERIFY_PERSONS_EMAIL_ADDRESS,
            payload,
            firstName: clientData?.firstName,
            lastName: clientData?.lastName
        });
    } catch (error) {
        next(error);
    }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const locales = getLocalesService();
        const session: Session = req.session as any as Session;
        const lang = selectLang(req.query.lang);
        const clientData: ClientData = session?.getExtraData(USER_DATA)!;
        const errorList = validationResult(req);
        if (!errorList.isEmpty()) {
            const pageProperties = getPageProperties(formatValidationError(errorList.array(), lang));
            renderValidationError(req, res, locales, lang, clientData, pageProperties);
        } else {
            clientData.emailAddress = req.body["email-address"];
            clientData.confirmEmailAddress = req.body.confirm;
            saveDataInSession(req, USER_DATA, clientData);

            const previousPage: string = session?.getExtraData(PREVIOUS_PAGE_URL)!;

            const reverifyIdentity: Identity = session.getExtraData(REVERIFY_IDENTITY)!;

            if (req.body["email-address"].trim().toLowerCase() !== reverifyIdentity.email.trim().toLowerCase()) {
                res.redirect(addLangToUrl(REVERIFY_BASE_URL + PROVIDE_DIFFERENT_EMAIL, lang));
            } else {
                const redirectUrl = previousPage === addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang)
                    ? REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS
                    : REVERIFY_BASE_URL + REVERIFY_PERSONS_NAME;

                res.redirect(addLangToUrl(redirectUrl, lang));
            }
        }
    } catch (error) {
        next(error);
    }
};

const renderValidationError = (req: Request, res: Response, locales: LocalesService, lang: string, clientData: ClientData, pageProperties: any) => {

    const session: Session = req.session as any as Session;
    const previousPageUrl: string = session?.getExtraData(PREVIOUS_PAGE_URL)!;

    const previousPage = previousPageUrl === addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang)
        ? addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang)
        : addLangToUrl(REVERIFY_BASE_URL + REVERIFY_PERSONAL_CODE, lang);

    res.status(400).render(config.PERSONS_EMAIL, {
        ...getLocaleInfo(locales, lang),
        previousPage: previousPage,
        currentUrl: REVERIFY_BASE_URL + REVERIFY_PERSONS_EMAIL_ADDRESS,
        payload: req.body,
        firstName: clientData?.firstName,
        lastName: clientData?.lastName,
        ...pageProperties
    });
};
