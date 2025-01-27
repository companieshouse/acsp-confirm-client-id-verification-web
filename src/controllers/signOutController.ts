import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { validationResult } from "express-validator";
import { getPreviousPageUrl } from "../services/url";
import { Session } from "@companieshouse/node-session-handler";
import { formatValidationError, getPageProperties } from "../validations/validation";
import { PREVIOUS_PAGE_URL } from "../utils/constants";
import { selectLang, getLocalesService, getLocaleInfo } from "../utils/localise";
import { BASE_URL, SIGN_OUT_URL, ACCOUNTS_SIGNOUT_PATH } from "../types/pageURL";
import { saveDataInSession } from "../utils/sessionHelper";
import logger from "../utils/logger";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const previousPageUrl = getPreviousPageUrl(req, BASE_URL);
    saveDataInSession(req, PREVIOUS_PAGE_URL, previousPageUrl);
    res.render(config.SIGN_OUT_PAGE, {
        previousPage: (previousPageUrl),
        ...getLocaleInfo(locales, lang),
        currentUrl: BASE_URL + SIGN_OUT_URL
    });
};

export const post = (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const session: Session = req.session as any as Session;
    const previousPageUrl : string = session?.getExtraData(PREVIOUS_PAGE_URL)!;
    const errorList = validationResult(req);
    logger.info(previousPageUrl);
    if (!errorList.isEmpty()) {
        const pageProperties = getPageProperties(formatValidationError(errorList.array(), lang));

        res.render(config.SIGN_OUT_PAGE, {
            ...getLocaleInfo(locales, lang),
            previousPage: (previousPageUrl),
            currentUrl: BASE_URL + SIGN_OUT_URL,
            ...pageProperties
        });
    } else {
        if (req.body.signout === "yes") {
            res.redirect((ACCOUNTS_SIGNOUT_PATH));
        } else {
            res.redirect((previousPageUrl));
        }
    }
};
