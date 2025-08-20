import { Request } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { PREVIOUS_PAGE_URL } from "../utils/constants";
import { selectLang, addLangToUrl } from "../utils/localise";
import logger from "../utils/logger";

export interface UrlData {
    baseUrl: string;
    checkYourAnswersUrl: string;
    nextPageUrl: string;
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

// Determines whether the user is accessing the page through check your answers screen by comparing against URL stored in session
export function getRedirectUrl (req: Request, config: UrlData): string {
    const lang = selectLang(req.query.lang);
    const session: Session = req.session as any as Session;
    const previousPageUrl: string = session?.getExtraData(PREVIOUS_PAGE_URL)!;

    if (previousPageUrl === addLangToUrl(config.baseUrl + config.checkYourAnswersUrl, lang)) {
        return addLangToUrl(config.baseUrl + config.checkYourAnswersUrl, lang);
    } else {
        return addLangToUrl(config.baseUrl + config.nextPageUrl, lang);
    }
}
