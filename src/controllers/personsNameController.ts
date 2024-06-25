import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { validationResult } from "express-validator";
import { formatValidationError, getPageProperties } from "../validations/validation";
import { BASE_URL, PERSONS_NAME, PERSONAL_CODE } from "../types/pageURL";
import { Session } from "@companieshouse/node-session-handler";
import { USER_DATA } from "../utils/constants";
import { selectLang, addLangToUrl, getLocalesService, getLocaleInfo } from "../utils/localise";
import { saveDataInSession } from "../utils/sessionHelper";
import { ClientData } from "../model/ClientData";

export const get = (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const session: Session = req.session as any as Session;
    const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};
    const payload = {
        "first-name": clientData.firstName,
        "middle-names": clientData.middleName,
        "last-name": clientData.lastName
    };
        res.render(config.PERSONS_NAME, {
            previousPage: addLangToUrl(BASE_URL, lang),
            ...getLocaleInfo(locales, lang),
            currentUrl: BASE_URL + PERSONS_NAME,
            payload
        });
};

export const post = (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const currentUrl: string = BASE_URL + PERSONS_NAME;
        const errorList = validationResult(req);
        const previousPage: string = addLangToUrl(BASE_URL, lang);
        if (!errorList.isEmpty()) {
            const pageProperties = getPageProperties(formatValidationError(errorList.array(), lang));
            res.status(400).render(config.PERSONS_NAME, {
                ...getLocaleInfo(locales, lang),
                previousPage,
                currentUrl,
                payload: req.body,
                ...pageProperties
            });
        } else {
            const session: Session = req.session as any as Session;
            const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};
            if (clientData) {
                clientData.firstName = req.body["first-name"];
                clientData.middleName = req.body["middle-names"];
                clientData.lastName = req.body["last-name"];
            }

            saveDataInSession(req, USER_DATA, clientData);

            res.redirect(addLangToUrl(BASE_URL + PERSONAL_CODE, lang));

        }
};
