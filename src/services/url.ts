import { Request } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { PREVIOUS_PAGE_URL } from "../utils/constants";
import { selectLang, addLangToUrl } from "../utils/localise";
import logger from "../utils/logger";

export interface UrlData {
    baseUrl: string;
    checkYourAnswersUrl: string;
    nextPageUrl: string;
    optionalNextPageUrl?: string;
}

export function getPreviousPageUrl (req: Request, basePath: string) {
    const headers = req.rawHeaders;
    const absolutePreviousPageUrl = headers.filter(item => item.includes(basePath))[0];
    // Don't attempt to determine a relative previous page URL if no absolute URL is found
    if (!absolutePreviousPageUrl) {
        return absolutePreviousPageUrl;
    }

    const startingIndexOfRelativePath = absolutePreviousPageUrl.indexOf(basePath);
    const relativePreviousPageUrl = absolutePreviousPageUrl.substring(startingIndexOfRelativePath);

    logger.debugRequest(req, `Relative previous page URL is ${relativePreviousPageUrl}`);

    return relativePreviousPageUrl;
}

/**
 * Determines the appropriate redirect URL based on the user's previous page and includes optional routing logic
 * Returns: check your answers URL if coming from CYA, optional next page URL if specified, or the default next page URL
 * @param req - Request object containing session data
 * @param config - UrlData interface containing required redirect Urls (baseUrl/checkYourAnswersUrl/nextPageUrl) and optional redirect Url (optionalNextPageUrl)
 * @param useOptionalNextPage - Optional boolean value to use the optionalNextPageUrl instead of the default next page if there are more than 2 routes
 */
export function getRedirectUrl (req: Request, config: UrlData, useOptionalNextPage?: boolean): string {
    const lang = selectLang(req.query.lang);
    const session: Session = req.session as any as Session;
    const previousPageUrl: string = session?.getExtraData(PREVIOUS_PAGE_URL)!;

    if (previousPageUrl === addLangToUrl(config.baseUrl + config.checkYourAnswersUrl, lang)) {
        return addLangToUrl(config.baseUrl + config.checkYourAnswersUrl, lang);
    } else if (useOptionalNextPage && config.optionalNextPageUrl) {
        return addLangToUrl(config.baseUrl + config.optionalNextPageUrl, lang);
    } else {
        return addLangToUrl(config.baseUrl + config.nextPageUrl, lang);
    }
}
