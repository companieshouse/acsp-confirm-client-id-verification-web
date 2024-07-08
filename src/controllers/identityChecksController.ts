import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { validationResult } from "express-validator";
import { formatValidationError, getPageProperties } from "../validations/validation";
import { BASE_URL, CONFIRM_HOME_ADDRESS, WHEN_IDENTITY_CHECKS_COMPLETED } from "../types/pageURL";
import { selectLang, addLangToUrl, getLocalesService, getLocaleInfo } from "../utils/localise";
import { Session } from "@companieshouse/node-session-handler";
import { USER_DATA } from "../utils/constants";
import { ClientData } from "model/ClientData";
import { saveDataInSession } from "../utils/sessionHelper";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const session: Session = req.session as any as Session;

    const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};
    saveDataInSession(req, USER_DATA, clientData);
    let payload;
    if (clientData.whenIdentityChecksCompleted) {
        const whenIdentityChecksCompleted = new Date(clientData.whenIdentityChecksCompleted);
        payload = {
            "wicc-year": whenIdentityChecksCompleted.getFullYear(),
            "wicc-month": whenIdentityChecksCompleted.getMonth() + 1,
            "wicc-day": whenIdentityChecksCompleted.getDate()
        };
    }
    res.render(config.WHEN_IDENTITY_CHECKS_COMPLETED, {
        ...getLocaleInfo(locales, lang),
        previousPage: addLangToUrl(BASE_URL + CONFIRM_HOME_ADDRESS, lang),
        currentUrl: BASE_URL + WHEN_IDENTITY_CHECKS_COMPLETED,
        firstName: clientData?.firstName,
        lastName: clientData?.lastName,
        payload
    });
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const session: Session = req.session as any as Session;

    const clientData: ClientData = session?.getExtraData(USER_DATA)!;
    const errorList = validationResult(req);
    if (!errorList.isEmpty()) {
        const pageProperties = getPageProperties(formatValidationError(errorList.array(), lang));
        res.status(400).render(config.WHEN_IDENTITY_CHECKS_COMPLETED, {
            ...getLocaleInfo(locales, lang),
            previousPage: addLangToUrl(BASE_URL + CONFIRM_HOME_ADDRESS, lang),
            currentUrl: BASE_URL + WHEN_IDENTITY_CHECKS_COMPLETED,
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
            clientData.whenIdentityChecksCompleted = whenIdentityChecksCompleted;
        }
        res.redirect(addLangToUrl(BASE_URL + WHEN_IDENTITY_CHECKS_COMPLETED, lang));
    }
};
