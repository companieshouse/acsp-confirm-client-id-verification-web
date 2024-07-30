import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { validationResult } from "express-validator";
import { formatValidationError, getPageProperties } from "../validations/validation";
import { BASE_URL, DATE_OF_BIRTH, EMAIL_ADDRESS, HOME_ADDRESS } from "../types/pageURL";
import { selectLang, addLangToUrl, getLocalesService, getLocaleInfo } from "../utils/localise";
import { Session } from "@companieshouse/node-session-handler";
import { USER_DATA } from "../utils/constants";
import { ClientData } from "model/ClientData";
import { saveDataInSession } from "../utils/sessionHelper";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const session: Session = req.session as any as Session;
    const previousPage: string = addLangToUrl(BASE_URL + EMAIL_ADDRESS, lang);
    const currentUrl: string = BASE_URL + DATE_OF_BIRTH;

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
    }
    res.render(config.DATE_OF_BIRTH, {
        ...getLocaleInfo(locales, lang),
        previousPage,
        currentUrl,
        firstName: clientData?.firstName,
        lastName: clientData?.lastName,
        payload
    });
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const currentUrl: string = BASE_URL + DATE_OF_BIRTH;

    const session: Session = req.session as any as Session;
    const clientData: ClientData = session?.getExtraData(USER_DATA)!;
    const previousPage: string = addLangToUrl(BASE_URL + EMAIL_ADDRESS, lang);
    const errorList = validationResult(req);
    if (!errorList.isEmpty()) {
        const pageProperties = getPageProperties(formatValidationError(errorList.array(), lang));
        res.status(400).render(config.DATE_OF_BIRTH, {
            previousPage,
            ...getLocaleInfo(locales, lang),
            currentUrl,
            pageProperties: pageProperties,
            payload: req.body,
            firstName: clientData?.firstName,
            lastName: clientData?.lastName
        });
    } else {
        if (clientData) {
            const dateOfBirth = new Date(
                req.body["dob-year"],
                req.body["dob-month"] - 1,
                req.body["dob-day"]
            );
            clientData.dateOfBirth = dateOfBirth;
        }
        res.redirect(addLangToUrl(BASE_URL + HOME_ADDRESS, lang));
    }
};
