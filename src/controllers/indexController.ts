import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { BASE_URL, PERSONS_NAME } from "../types/pageURL";
import {
    addLangToUrl,
    getLocaleInfo,
    getLocalesService,
    selectLang
} from "../utils/localise";
import { PIWIK_START_GOAL_ID } from "../utils/properties";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();

    res.render(config.HOME, {
        ...getLocaleInfo(locales, lang),
        PIWIK_START_GOAL_ID,
        currentUrl: BASE_URL
    });
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const nextPageUrl = addLangToUrl(BASE_URL + PERSONS_NAME, lang);
    res.redirect(nextPageUrl);
};
