import { NextFunction, Request, Response } from "express";
import * as config from "../../config";
import { REVERIFY_BASE_URL, REVERIFY_PERSONAL_CODE } from "../../types/pageURL";
import {
    addLangToUrl,
    getLocaleInfo,
    getLocalesService,
    selectLang
} from "../../utils/localise";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();

    res.render(config.REVERIFY_HOME, {
        ...getLocaleInfo(locales, lang),
        currentUrl: REVERIFY_BASE_URL
    });
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    res.redirect(addLangToUrl(REVERIFY_BASE_URL + REVERIFY_PERSONAL_CODE, lang));
};
