import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { BASE_URL, PERSONS_NAME } from "../types/pageURL";
import { MATOMO_LINK_CLICK, MATOMO_BUTTON_CLICK } from "../utils/constants";
import {
    addLangToUrl,
    getLocaleInfo,
    getLocalesService,
    selectLang
} from "../utils/localise";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();

    res.render(config.HOME, {
        ...getLocaleInfo(locales, lang),
        matomoLinkClick: MATOMO_LINK_CLICK,
        matomoButtonClick: MATOMO_BUTTON_CLICK,
        currentUrl: BASE_URL
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
