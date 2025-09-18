import { NextFunction, Request, Response } from "express";
import { BASE_URL, MUST_BE_AUTHORISED_AGENT, REVERIFY_BASE_URL, REVERIFY_MUST_BE_AUTHORISED_AGENT } from "../types/pageURL";
import { addLangToUrl, selectLang } from "../utils/localise";
import { getLoggedInAcspNumber } from "../utils/session";
export const userIsPartOfAcspMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = selectLang(req.query.lang);
        const acspNumber: string = getLoggedInAcspNumber(req.session);
        const isReverifyService: boolean = req.originalUrl.includes(REVERIFY_BASE_URL);
        if (!acspNumber) {
            const mustBeAuthorisedAgentUrl = isReverifyService ? REVERIFY_MUST_BE_AUTHORISED_AGENT : MUST_BE_AUTHORISED_AGENT;
            const baseUrl = isReverifyService ? REVERIFY_BASE_URL : BASE_URL;
            if (!req.originalUrl.includes(mustBeAuthorisedAgentUrl)) {
                res.redirect(addLangToUrl(baseUrl + mustBeAuthorisedAgentUrl, lang));
                return;
            }
        }
        next();
    } catch (error) {
        next(error);
    }
};
