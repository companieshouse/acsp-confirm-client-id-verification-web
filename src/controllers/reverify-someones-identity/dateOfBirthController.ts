import { NextFunction, Request, Response } from "express";
import * as config from "../../config";
import { validationResult } from "express-validator";
import { formatValidationError, getPageProperties } from "../../validations/validation";
import { REVERIFY_BASE_URL, REVERIFY_DATE_OF_BIRTH, REVERIFY_SHOW_ON_PUBLIC_REGISTER, REVERIFY_CHECK_YOUR_ANSWERS, REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS, REVERIFY_PERSONS_NAME_ON_PUBLIC_REGISTER } from "../../types/pageURL";
import { selectLang, addLangToUrl, getLocalesService, getLocaleInfo } from "../../utils/localise";
import { Session } from "@companieshouse/node-session-handler";
import { USER_DATA, PREVIOUS_PAGE_URL } from "../../utils/constants";
import { ClientData } from "model/ClientData";
import { saveDataInSession } from "../../utils/sessionHelper";
import { getPreviousPageUrl } from "../../services/url";
import { FormatService } from "../../services/formatService";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const session: Session = req.session as any as Session;
        const currentUrl: string = REVERIFY_BASE_URL + REVERIFY_DATE_OF_BIRTH;

        const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};
        saveDataInSession(req, USER_DATA, clientData);

        let payload;
        if (clientData.dateOfBirth) {
            const dateOfBirth = new Date(clientData.dateOfBirth);
            payload = {
                "dob-year": dateOfBirth.getFullYear(),
                "dob-month": dateOfBirth.getMonth() + 1,
                "dob-day": dateOfBirth.getDate()
            };
        };

        const personFullName = FormatService.getFormattedFullName(
            clientData.firstName,
            clientData.middleName,
            clientData.lastName
        );

        const previousPageUrl = getPreviousPageUrl(req, REVERIFY_BASE_URL);
        saveDataInSession(req, PREVIOUS_PAGE_URL, previousPageUrl);

        const previousPage = determinePreviousPage(previousPageUrl, lang);

        res.render(config.DATE_OF_BIRTH, {
            ...getLocaleInfo(locales, lang),
            previousPage,
            currentUrl,
            personFullName,
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
        const clientData: ClientData = session?.getExtraData(USER_DATA)!;
        const currentUrl: string = REVERIFY_BASE_URL + REVERIFY_DATE_OF_BIRTH;
        const previousPageUrl: string = session?.getExtraData(PREVIOUS_PAGE_URL)!;

        const personFullName = FormatService.getFormattedFullName(
            clientData.firstName,
            clientData.middleName,
            clientData.lastName
        );

        const previousPage = determinePreviousPage(previousPageUrl, lang);

        const errorList = validationResult(req);
        if (!errorList.isEmpty()) {
            const pageProperties = getPageProperties(formatValidationError(errorList.array(), lang));
            res.status(400).render(config.DATE_OF_BIRTH, {
                previousPage,
                ...getLocaleInfo(locales, lang),
                currentUrl,
                pageProperties: pageProperties,
                payload: req.body,
                personFullName
            });
        } else {
            if (clientData) {
                const dateOfBirth = new Date(
                    req.body["dob-year"],
                    req.body["dob-month"] - 1,
                    req.body["dob-day"]
                );
                clientData.dateOfBirth = dateOfBirth.toISOString();
            }

            if (previousPageUrl === addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang)) {
                res.redirect(addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang));
            } else {
                res.redirect(addLangToUrl(REVERIFY_BASE_URL + REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS, lang));
            }
        }
    } catch (error) {
        next(error);
    }
};

const determinePreviousPage = (previousPageUrl: string, lang: string): string => {
    if (previousPageUrl === addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang)) {
        return addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang);
    } else if (previousPageUrl === addLangToUrl(REVERIFY_BASE_URL + REVERIFY_PERSONS_NAME_ON_PUBLIC_REGISTER, lang)) {
        return addLangToUrl(REVERIFY_BASE_URL + REVERIFY_PERSONS_NAME_ON_PUBLIC_REGISTER, lang);
    } else {
        return addLangToUrl(REVERIFY_BASE_URL + REVERIFY_SHOW_ON_PUBLIC_REGISTER, lang);
    }
};
