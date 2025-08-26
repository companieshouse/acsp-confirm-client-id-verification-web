import { NextFunction, Request, Response } from "express";
import * as config from "../../config";
import { REVERIFY_BASE_URL, REVERIFY_PERSONAL_CODE } from "../../types/pageURL";
import {
    addLangToUrl,
    getLocaleInfo,
    getLocalesService,
    selectLang
} from "../../utils/localise";
import { PIWIK_REVERIFY_START_GOAL_ID } from "../../utils/properties";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();

    res.render(config.REVERIFY_HOME, {
        ...getLocaleInfo(locales, lang),
        currentUrl: REVERIFY_BASE_URL,
        PIWIK_REVERIFY_START_GOAL_ID
    });
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    res.redirect(addLangToUrl(REVERIFY_BASE_URL + REVERIFY_PERSONAL_CODE, lang));
};
