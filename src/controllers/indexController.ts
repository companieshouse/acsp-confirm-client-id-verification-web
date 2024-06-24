import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { BASE_URL, PERSONS_NAME } from "../types/pageURL";
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
        currentUrl: BASE_URL
    });
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
        const lang = selectLang(req.query.lang);
        const nextPageUrl = addLangToUrl(BASE_URL + PERSONS_NAME, lang);

        res.redirect(nextPageUrl);
};
