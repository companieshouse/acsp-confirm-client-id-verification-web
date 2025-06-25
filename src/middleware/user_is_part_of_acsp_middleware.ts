import { NextFunction, Request, Response } from "express";
import { BASE_URL, MUST_BE_AUTHORISED_AGENT } from "../types/pageURL";
import { addLangToUrl, selectLang } from "../utils/localise";
import { getLoggedInAcspNumber } from "../utils/session";

export const userIsPartOfAcspMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = selectLang(req.query.lang);
        const acspNumber: string = getLoggedInAcspNumber(req.session);
        if (!acspNumber) {
            if (!req.originalUrl.includes(MUST_BE_AUTHORISED_AGENT)) {
                res.redirect(addLangToUrl(BASE_URL + MUST_BE_AUTHORISED_AGENT, lang));
                return;
            }
        }

        next();
    } catch (error) {
        next(error);
    }
};
