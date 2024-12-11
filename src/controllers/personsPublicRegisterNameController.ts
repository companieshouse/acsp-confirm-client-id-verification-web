import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { validationResult } from "express-validator";
import { formatValidationError, getPageProperties } from "../validations/validation";
import { BASE_URL, CHECK_YOUR_ANSWERS, PERSONS_NAME_ON_PUBLIC_REGISTER, PERSONAL_CODE } from "../types/pageURL";
import { Session } from "@companieshouse/node-session-handler";
import { USER_DATA, MATOMO_BUTTON_CLICK, PREVIOUS_PAGE_URL } from "../utils/constants";
import { selectLang, addLangToUrl, getLocalesService, getLocaleInfo } from "../utils/localise";
import { saveDataInSession } from "../utils/sessionHelper";
import { ClientData } from "../model/ClientData";
import { getPreviousPageUrl } from "../services/url";

export const get = (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const session: Session = req.session as any as Session;
    const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};
    const payload = {
        "first-name": clientData.preferredFirstName,
        "middle-names": clientData.preferredMiddleName,
        "last-name": clientData.preferredLastName
    };

    const previousPageUrl = getPreviousPageUrl(req, BASE_URL);
    saveDataInSession(req, PREVIOUS_PAGE_URL, previousPageUrl);

    const previousPage = previousPageUrl === addLangToUrl(BASE_URL + CHECK_YOUR_ANSWERS, lang)
        ? addLangToUrl(BASE_URL + CHECK_YOUR_ANSWERS, lang)
        : addLangToUrl(BASE_URL, lang);

    res.render(config.PERSONS_NAME_ON_PUBLIC_REGISTER, {
        previousPage: previousPage,
        ...getLocaleInfo(locales, lang),
        matomoButtonClick: MATOMO_BUTTON_CLICK,
        currentUrl: BASE_URL + PERSONS_NAME_ON_PUBLIC_REGISTER,
        payload
    });
};

export const post = (req: Request, res: Response, next: NextFunction) => {
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

        res.status(400).render(config.PERSONS_NAME_ON_PUBLIC_REGISTER, {
            ...getLocaleInfo(locales, lang),
            previousPage: previousPage,
            currentUrl: BASE_URL + PERSONS_NAME_ON_PUBLIC_REGISTER,
            payload: req.body,
            ...pageProperties
        });
    } else {
        const session: Session = req.session as any as Session;
        const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};

        clientData.preferredFirstName = req.body["first-name"];
        clientData.preferredMiddleName = req.body["middle-names"];
        clientData.preferredLastName = req.body["last-name"];

        saveDataInSession(req, USER_DATA, clientData);

        const previousPageUrl: string = session?.getExtraData(PREVIOUS_PAGE_URL)!;

        if (previousPageUrl === addLangToUrl(BASE_URL + CHECK_YOUR_ANSWERS, lang)) {
            res.redirect(addLangToUrl(BASE_URL + CHECK_YOUR_ANSWERS, lang));
        } else {
            res.redirect(addLangToUrl(BASE_URL + PERSONAL_CODE, lang));
        }
    }
};
