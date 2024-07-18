import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { BASE_URL, PERSONAL_CODE, EMAIL_ADDRESS, DATE_OF_BIRTH } from "../types/pageURL";
import { addLangToUrl, getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";
import { formatValidationError, getPageProperties } from "../validations/validation";
import { validationResult } from "express-validator";
import { Session } from "@companieshouse/node-session-handler";
import { ClientData } from "model/ClientData";
import { USER_DATA } from "../utils/constants";
import { saveDataInSession } from "../utils/sessionHelper";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const session: Session = req.session as any as Session;
    const clientData: ClientData = session.getExtraData(USER_DATA)!;

    const payload = {
        "email-address": clientData?.emailAddress,
        confirm: clientData?.confirmEmailAddress
    };

    res.render(config.PERSONS_EMAIL, {
        ...getLocaleInfo(locales, lang),
        previousPage: addLangToUrl(BASE_URL + PERSONAL_CODE, lang),
        currentUrl: BASE_URL + EMAIL_ADDRESS,
        payload,
        firstName: clientData?.firstName,
        lastName: clientData?.lastName
    });
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const errorList = validationResult(req);
    const session: Session = req.session as any as Session;
    const clientData: ClientData = session?.getExtraData(USER_DATA)!;
    if (!errorList.isEmpty()) {
        const pageProperties = getPageProperties(formatValidationError(errorList.array(), lang));
        res.status(400).render(config.PERSONS_EMAIL, {
            ...getLocaleInfo(locales, lang),
            previousPage: addLangToUrl(BASE_URL + PERSONAL_CODE, lang),
            currentUrl: BASE_URL + EMAIL_ADDRESS,
            payload: req.body,
            firstName: clientData?.firstName,
            lastName: clientData?.lastName,
            ...pageProperties
        });
    } else {
        clientData.emailAddress = req.body["email-address"];
        clientData.confirmEmailAddress = req.body.confirm;

        saveDataInSession(req, USER_DATA, clientData);

        res.redirect(addLangToUrl(BASE_URL + DATE_OF_BIRTH, lang));
    }
};
