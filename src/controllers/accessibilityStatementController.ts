import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { ACCESSIBILITY_STATEMENT, BASE_URL } from "../types/pageURL";
import { getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    res.render(config.ACCESSIBILITY_STATEMENT, {
        ...getLocaleInfo(locales, lang),
        currentUrl: BASE_URL + ACCESSIBILITY_STATEMENT
    });
};
