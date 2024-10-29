import { Session } from "@companieshouse/node-session-handler";
import { NextFunction, Request, Response } from "express";
import countryList from "../../lib/countryList";
import * as config from "../config";
import { BASE_URL, PERSONS_NAME } from "../types/pageURL";
import { ClientData } from "../model/ClientData";
import { MATOMO_LINK_CLICK, MATOMO_BUTTON_CLICK, USER_DATA } from "../utils/constants";
import {
    addLangToUrl,
    getLocaleInfo,
    getLocalesService,
    selectLang
} from "../utils/localise";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const session: Session = req.session as any as Session;
    const clientData: ClientData = session?.getExtraData(USER_DATA)!;

    res.render(config.ID_DOCUMENT_DETAILS, {
        ...getLocaleInfo(locales, lang),
        matomoLinkClick: MATOMO_LINK_CLICK,
        matomoButtonClick: MATOMO_BUTTON_CLICK,
        currentUrl: BASE_URL,
        documentsChecked: clientData.documentsChecked,
        countryList: countryList

    });
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = selectLang(req.query.lang);
        const nextPageUrl = addLangToUrl(BASE_URL + PERSONS_NAME, lang);

        res.redirect(nextPageUrl);
    } catch (error) {
        next(error);
    }
};
