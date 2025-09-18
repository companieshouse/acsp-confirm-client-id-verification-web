import { NextFunction, Request, Response } from "express";
import * as config from "../../config";
import { addLangToUrl, getLocaleInfo, getLocalesService, selectLang } from "../../utils/localise";
import { REGISTER_AS_COMPANIES_HOUSE_AUTHORISED_AGENT, REVERIFY_BASE_URL, REVERIFY_MUST_BE_AUTHORISED_AGENT } from "../../types/pageURL";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();

        res.render(config.MUST_BE_AUTHORISED_AGENT, {
            ...getLocaleInfo(locales, lang),
            currentUrl: REVERIFY_BASE_URL + REVERIFY_MUST_BE_AUTHORISED_AGENT,
            applyAsACSPLink: addLangToUrl(REGISTER_AS_COMPANIES_HOUSE_AUTHORISED_AGENT, lang)
        });
    } catch (error) {
        next(error);
    }
};
