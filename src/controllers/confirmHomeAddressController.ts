import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { selectLang, addLangToUrl, getLocalesService, getLocaleInfo } from "../utils/localise";
import { HOME_ADDRESS, BASE_URL, CONFIRM_HOME_ADDRESS, WHEN_IDENTITY_CHECKS_COMPLETED, HOME_ADDRESS_MANUAL } from "../types/pageURL";
import { Session } from "@companieshouse/node-session-handler";
import { USER_DATA, MATOMO_BUTTON_CLICK, MATOMO_LINK_CLICK } from "../utils/constants";
import { ClientData } from "model/ClientData";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const session: Session = req.session as any as Session;
    const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};

    res.render(config.CONFIRM_HOME_ADDRESS, {
        previousPage: addLangToUrl(BASE_URL + HOME_ADDRESS, lang),
        editPage: addLangToUrl(BASE_URL + HOME_ADDRESS_MANUAL, lang),
        ...getLocaleInfo(locales, lang),
        currentUrl: BASE_URL + CONFIRM_HOME_ADDRESS,
        matomoButtonClick: MATOMO_BUTTON_CLICK,
        matomoLinkClick: MATOMO_LINK_CLICK,
        address: clientData?.address,
        firstName: clientData?.firstName,
        lastName: clientData?.lastName
    });
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    res.redirect(addLangToUrl(BASE_URL + WHEN_IDENTITY_CHECKS_COMPLETED, lang));
};
