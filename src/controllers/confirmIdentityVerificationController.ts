import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { selectLang, addLangToUrl, getLocalesService, getLocaleInfo } from "../utils/localise";
import { BASE_URL, CONFIRM_IDENTITY_VERIFICATION, CHECK_YOUR_ANSWERS, WHICH_IDENTITY_DOCS_CHECKED_GROUP1, WHICH_IDENTITY_DOCS_CHECKED_GROUP2 } from "../types/pageURL";
import { Session } from "@companieshouse/node-session-handler";
import { USER_DATA, MATOMO_BUTTON_CLICK } from "../utils/constants";
import { ClientData } from "../model/ClientData";
import { validationResult } from "express-validator";
import { formatValidationError, getPageProperties } from "../validations/validation";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const session: Session = req.session as any as Session;
    const clientData: ClientData = session.getExtraData(USER_DATA)!;
    const formattedDate = new Date(clientData.whenIdentityChecksCompleted!)
        .toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

    const payload = {
        declaration: clientData.confirmIdentityVerified
    };

    res.render(config.CONFIRM_IDENTITY_VERIFICATION, {
        previousPage: addLangToUrl(getBackUrl(clientData.howIdentityDocsChecked!), lang),
        ...getLocaleInfo(locales, lang),
        currentUrl: BASE_URL + CONFIRM_IDENTITY_VERIFICATION,
        matomoButtonClick: MATOMO_BUTTON_CLICK,
        firstName: clientData?.firstName,
        lastName: clientData?.lastName,
        formattedDate,
        payload
    });
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const errorList = validationResult(req);
    const session: Session = req.session as any as Session;
    const clientData: ClientData = session.getExtraData(USER_DATA)!;
    const formattedDate = new Date(clientData.whenIdentityChecksCompleted!)
        .toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

    if (!errorList.isEmpty()) {
        const pageProperties = getPageProperties(formatValidationError(errorList.array(), lang));
        res.status(400).render(config.CONFIRM_IDENTITY_VERIFICATION, {
            previousPage: addLangToUrl(getBackUrl(clientData.howIdentityDocsChecked!), lang),
            ...getLocaleInfo(locales, lang),
            currentUrl: BASE_URL + CONFIRM_IDENTITY_VERIFICATION,
            firstName: clientData?.firstName,
            lastName: clientData?.lastName,
            formattedDate,
            ...pageProperties
        });
    } else {
        if (clientData) {
            clientData.confirmIdentityVerified = req.body.declaration;
        }
        res.redirect(addLangToUrl(BASE_URL + CHECK_YOUR_ANSWERS, lang));
    }
};

const getBackUrl = (selectedOption: string) => {
    if (selectedOption === "cryptographic_security_features_checked") {
        return BASE_URL + WHICH_IDENTITY_DOCS_CHECKED_GROUP1;
    } else {
        return BASE_URL + WHICH_IDENTITY_DOCS_CHECKED_GROUP2;
    }
};
