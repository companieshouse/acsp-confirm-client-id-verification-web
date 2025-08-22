import { NextFunction, Request, Response } from "express";
import { REVERIFY_BASE_URL, REVERIFY_CHECK_YOUR_ANSWERS, REVERIFY_PERSONS_NAME, REVERIFY_SHOW_ON_PUBLIC_REGISTER, REVERIFY_PERSONS_NAME_ON_PUBLIC_REGISTER, REVERIFY_DATE_OF_BIRTH } from "../../types/pageURL";
import { selectLang, addLangToUrl, getLocalesService, getLocaleInfo } from "../../utils/localise";
import { Session } from "@companieshouse/node-session-handler";
import { ClientData } from "model/ClientData";
import { PREVIOUS_PAGE_URL, USER_DATA } from "../../utils/constants";
import * as config from "../../config";
import { saveDataInSession } from "../../utils/sessionHelper";
import { validationResult } from "express-validator";
import { formatValidationError, getPageProperties } from "../../validations/validation";
import { getPreviousPageUrl, getRedirectUrl, UrlData } from "../../services/url";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = selectLang(req.query.lang);
        const session: Session = req.session as any as Session;
        const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};
        const currentUrl: string = REVERIFY_BASE_URL + REVERIFY_SHOW_ON_PUBLIC_REGISTER;
        const selectedOption = clientData.useNameOnPublicRegister;

        const personFullName = [clientData.firstName, clientData.middleName, clientData.lastName]
            .filter(name => name && name.trim().length > 0)
            .join(" ");

        const previousPageUrl = getPreviousPageUrl(req, REVERIFY_BASE_URL);
        saveDataInSession(req, PREVIOUS_PAGE_URL, previousPageUrl);

        const previousPage = previousPageUrl === addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang)
            ? addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang)
            : addLangToUrl(REVERIFY_BASE_URL + REVERIFY_PERSONS_NAME, lang);

        res.render(config.REVERIFY_WHAT_WE_SHOW_ON_PUBLIC_REGISTER, {
            ...getLocaleInfo(getLocalesService(), lang),
            currentUrl,
            previousPage,
            personFullName,
            selectedOption
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
        const selectedOption = req.body.useNameOnPublicRegisterRadio;
        const currentUrl: string = REVERIFY_BASE_URL + REVERIFY_SHOW_ON_PUBLIC_REGISTER;
        const previousPageUrl: string = session?.getExtraData(PREVIOUS_PAGE_URL)!;

        const personFullName = [clientData.firstName, clientData.middleName, clientData.lastName]
            .filter(name => name && name.trim().length > 0)
            .join(" ");

        const previousPage = previousPageUrl === addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang)
            ? addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang)
            : addLangToUrl(REVERIFY_BASE_URL + REVERIFY_PERSONS_NAME, lang);

        const errorList = validationResult(req);
        if (!errorList.isEmpty()) {
            const pageProperties = getPageProperties(formatValidationError(errorList.array(), lang));

            res.status(400).render(config.REVERIFY_WHAT_WE_SHOW_ON_PUBLIC_REGISTER, {
                ...getLocaleInfo(locales, lang),
                previousPage,
                currentUrl,
                personFullName,
                selectedOption,
                pageProperties: pageProperties
            });
        } else {
            clientData.useNameOnPublicRegister = selectedOption;

            // Clearing previous preferred name session values when switching answer to yes and coming from Check your answers page
            if (selectedOption === "use_name_on_public_register_yes" && previousPageUrl === addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang)) {
                clientData.preferredFirstName = "";
                clientData.preferredMiddleName = "";
                clientData.preferredLastName = "";
            }

            saveDataInSession(req, USER_DATA, clientData);

            const serviceConfig: UrlData = {
                baseUrl: REVERIFY_BASE_URL,
                checkYourAnswersUrl: REVERIFY_CHECK_YOUR_ANSWERS,
                nextPageUrl: REVERIFY_DATE_OF_BIRTH,
                optionalNextPageUrl: REVERIFY_PERSONS_NAME_ON_PUBLIC_REGISTER
            };

            const useOptionalNextPageUrl = selectedOption === "use_name_on_public_register_no";
            const redirectUrl = getRedirectUrl(req, serviceConfig, useOptionalNextPageUrl);
            res.redirect(redirectUrl);
        }
    } catch (error) {
        next(error);
    }
};
