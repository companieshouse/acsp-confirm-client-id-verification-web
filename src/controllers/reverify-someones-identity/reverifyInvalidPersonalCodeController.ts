import { NextFunction, Request, Response } from "express";
import * as config from "../../config";
import { addLangToUrl, getLocaleInfo, getLocalesService, selectLang } from "../../utils/localise";
import { REVERIFY_BASE_URL, REVERIFY_PERSONAL_CODE, REVERIFY_PERSONAL_CODE_IS_INVALID } from "../../types/pageURL";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();

        res.render(config.REVERIFY_INVALID_PERSONAL_CODE, {
            ...getLocaleInfo(locales, lang),
            currentUrl: REVERIFY_BASE_URL + REVERIFY_PERSONAL_CODE_IS_INVALID,
            previousPage: addLangToUrl(REVERIFY_BASE_URL + REVERIFY_PERSONAL_CODE, lang)
        });
    } catch (error) {
        next(error);
    }
};
