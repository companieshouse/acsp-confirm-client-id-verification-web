import { NextFunction, Request, Response } from "express";
import { BASE_URL, CHECK_YOUR_ANSWERS, PERSONAL_CODE, PERSONS_NAME, PERSONS_NAME_ON_PUBLIC_REGISTER, USE_NAME_ON_PUBLIC_REGISTER } from "../types/pageURL";
import { selectLang, addLangToUrl, getLocalesService, getLocaleInfo } from "../utils/localise";
import { Session } from "@companieshouse/node-session-handler";
import { ClientData } from "model/ClientData";
import { PREVIOUS_PAGE_URL, USER_DATA } from "../utils/constants";
import * as config from "../config";
import { saveDataInSession } from "../utils/sessionHelper";
import { validationResult } from "express-validator";
import { formatValidationError, getPageProperties } from "../validations/validation";
import { getPreviousPageUrl } from "../services/url";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const session: Session = req.session as any as Session;
    const clientData: ClientData = session.getExtraData(USER_DATA)!;
    const currentUrl: string = BASE_URL + USE_NAME_ON_PUBLIC_REGISTER;
    const selectedOption = clientData.useNameOnPublicRegister;

    const previousPageUrl = getPreviousPageUrl(req, BASE_URL);
    saveDataInSession(req, PREVIOUS_PAGE_URL, previousPageUrl);

    const previousPage = previousPageUrl === addLangToUrl(BASE_URL + CHECK_YOUR_ANSWERS, lang)
        ? addLangToUrl(BASE_URL + CHECK_YOUR_ANSWERS, lang)
        : addLangToUrl(BASE_URL + PERSONS_NAME, lang);

    res.render(config.USE_NAME_ON_PUBLIC_REGISTER, {
        ...getLocaleInfo(getLocalesService(), lang),
        currentUrl,
        previousPage,
        firstName: clientData.firstName,
        lastName: clientData.lastName,
        selectedOption
    });
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const session: Session = req.session as any as Session;
    const clientData: ClientData = session?.getExtraData(USER_DATA)!;
    const selectedOption = req.body.useNameOnPublicRegisterRadio;
    const currentUrl: string = BASE_URL + USE_NAME_ON_PUBLIC_REGISTER;
    const previousPageUrl: string = session?.getExtraData(PREVIOUS_PAGE_URL)!;

    const previousPage = previousPageUrl === addLangToUrl(BASE_URL + CHECK_YOUR_ANSWERS, lang)
        ? addLangToUrl(BASE_URL + CHECK_YOUR_ANSWERS, lang)
        : addLangToUrl(BASE_URL + PERSONS_NAME, lang);

    const errorList = validationResult(req);
    if (!errorList.isEmpty()) {
        const pageProperties = getPageProperties(formatValidationError(errorList.array(), lang));

        res.status(400).render(config.USE_NAME_ON_PUBLIC_REGISTER, {
            ...getLocaleInfo(locales, lang),
            previousPage,
            currentUrl,
            firstName: clientData.firstName,
            lastName: clientData.lastName,
            selectedOption,
            pageProperties: pageProperties
        });
    } else {
        clientData.useNameOnPublicRegister = selectedOption;
        saveDataInSession(req, USER_DATA, clientData);
        if (selectedOption === "use_name_on_public_register_yes" && previousPageUrl === addLangToUrl(BASE_URL + CHECK_YOUR_ANSWERS, lang)) {
            // Clearing previous values when switching answer to yes
            clientData.preferredFirstName = "";
            clientData.preferredMiddleName = "";
            clientData.preferredLastName = "";
            saveDataInSession(req, USER_DATA, clientData);
            res.redirect(addLangToUrl(BASE_URL + CHECK_YOUR_ANSWERS, lang));
        } else if (selectedOption === "use_name_on_public_register_yes") {
            res.redirect(addLangToUrl(BASE_URL + PERSONAL_CODE, lang));
        } else if (selectedOption === "use_name_on_public_register_no") {
            res.redirect(addLangToUrl(BASE_URL + PERSONS_NAME_ON_PUBLIC_REGISTER, lang));
        }
    }
};
