import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { BASE_URL, EMAIL_ADDRESS, DATE_OF_BIRTH, CHECK_YOUR_ANSWERS, CONFIRM_EMAIL_ADDRESS } from "../types/pageURL";
import { addLangToUrl, getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";
import { formatValidationError, getPageProperties } from "../validations/validation";
import { validationResult } from "express-validator";
import { Session } from "@companieshouse/node-session-handler";
import { ClientData } from "model/ClientData";
import { USER_DATA, PREVIOUS_PAGE_URL, CHECK_YOUR_ANSWERS_FLAG } from "../utils/constants";
import { saveDataInSession } from "../utils/sessionHelper";
import { getPreviousPageUrl } from "../services/url";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const session: Session = req.session as any as Session;
        const clientData: ClientData = session.getExtraData(USER_DATA)!;

        const previousPageUrl = getPreviousPageUrl(req, BASE_URL);
        saveDataInSession(req, PREVIOUS_PAGE_URL, previousPageUrl);

        res.render(config.CONFIRM_PERSONS_EMAIL, {
            ...getLocaleInfo(locales, lang),
            previousPage: addLangToUrl(BASE_URL + EMAIL_ADDRESS, lang),
            currentUrl: BASE_URL + CONFIRM_EMAIL_ADDRESS,
            emailAddress: clientData?.emailAddress,
            firstName: clientData?.firstName,
            lastName: clientData?.lastName
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
        const session: Session = req.session as any as Session;
        const clientData: ClientData = session?.getExtraData(USER_DATA)!;

        if (!errorList.isEmpty()) {
            const pageProperties = getPageProperties(formatValidationError(errorList.array(), lang));

            // Render the screen with validation errors
            res.status(400).render(config.CONFIRM_PERSONS_EMAIL, {
                ...getLocaleInfo(locales, lang),
                previousPage: addLangToUrl(BASE_URL + EMAIL_ADDRESS, lang),
                currentUrl: BASE_URL + CONFIRM_EMAIL_ADDRESS,
                payload: req.body,
                emailAddress: clientData?.emailAddress,
                firstName: clientData?.firstName,
                lastName: clientData?.lastName,
                ...pageProperties
            });
        } else {
            // Redirect to date of birth screen unless you originally came from the check your answers page.
            const checkYourAnswersFlag = session?.getExtraData(CHECK_YOUR_ANSWERS_FLAG);
            const nextPageUrl = checkYourAnswersFlag
                ? addLangToUrl(BASE_URL + CHECK_YOUR_ANSWERS, lang)
                : addLangToUrl(BASE_URL + DATE_OF_BIRTH, lang);
            res.redirect(nextPageUrl);
        }
    } catch (error) {
        next(error);
    }
};
