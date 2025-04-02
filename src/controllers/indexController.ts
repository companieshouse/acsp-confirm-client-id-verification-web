import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { BASE_URL, PERSONS_NAME } from "../types/pageURL";
import { CHECK_YOUR_ANSWERS_FLAG, MATOMO_LINK_CLICK, REFERENCE, USER_DATA } from "../utils/constants";
import {
    addLangToUrl,
    getLocaleInfo,
    getLocalesService,
    selectLang
} from "../utils/localise";
import { PIWIK_START_GOAL_ID } from "../utils/properties";
import { Session } from "@companieshouse/node-session-handler";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const session: Session = req.session as any as Session;

    // This handles scenario where other pages link to this service
    // and we need to clear the session data e.g. authorised-agent account
    const previousUrl = req.headers.referer;

    if (!previousUrl?.includes(BASE_URL)) {
        session.deleteExtraData(USER_DATA);
        session.deleteExtraData(CHECK_YOUR_ANSWERS_FLAG);
        session.deleteExtraData(REFERENCE);
    }

    res.render(config.HOME, {
        ...getLocaleInfo(locales, lang),
        matomoLinkClick: MATOMO_LINK_CLICK,
        PIWIK_START_GOAL_ID,
        currentUrl: BASE_URL
    });
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const nextPageUrl = addLangToUrl(BASE_URL + PERSONS_NAME, lang);
    res.redirect(nextPageUrl);
};
