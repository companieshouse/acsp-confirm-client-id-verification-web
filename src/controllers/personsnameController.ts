import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { validationResult } from "express-validator";
import { ErrorService } from "../services/errorService";
import { formatValidationError, getPageProperties } from "../validations/validation";
import { BASE_URL, PERSONS_NAME, PERSONAL_CODE } from "../types/pageURL";
import { Session } from "@companieshouse/node-session-handler";
import { USER_DATA } from "../utils/constants";
import { selectLang, addLangToUrl, getLocalesService, getLocaleInfo } from "../utils/localise";
import { saveDataInSession } from "../utils/sessionHelper";
import logger from "../lib/Logger";
import { ClientData } from "../model/ClientData";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const session: Session = req.session as any as Session;
    const previousPage: string = addLangToUrl(BASE_URL, lang);
    const currentUrl: string = BASE_URL + PERSONS_NAME;
    try {
        res.render(config.PERSONS_NAME, {
            previousPage,
            ...getLocaleInfo(locales, lang),
            currentUrl
        });
    } catch (err) {
        logger.error("Sorry we are experiencing technical difficulties");
        const error = new ErrorService();
        error.renderErrorPage(res, locales, lang, currentUrl);
    }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const currentUrl: string = BASE_URL + PERSONS_NAME;
    try {
        const errorList = validationResult(req);
        const previousPage: string = addLangToUrl(BASE_URL, lang);
        if (!errorList.isEmpty()) {
            const pageProperties = getPageProperties(formatValidationError(errorList.array(), lang));
            res.status(400).render(config.PERSONS_NAME, {
                ...getLocaleInfo(locales, lang),
                previousPage,
                currentUrl,
                payload: req.body,
                ...pageProperties
            });
        } else {
            // const session: Session = req.session as any as Session;
            // const acspData : ClientData = session?.getExtraData(USER_DATA)!;
            // if (acspData) {
            //     acspData.firstName = req.body["first-name"];
            //     acspData.middleName = req.body["middle-names"];
            //     acspData.lastName = req.body["last-name"];
            // }

            // saveDataInSession(req, USER_DATA, acspData);

            // const detailsAnswers: Answers = session.getExtraData(ANSWER_DATA) || {};
            // detailsAnswers.name = req.body["first-name"] + " " + req.body["last-name"];
            // saveDataInSession(req, ANSWER_DATA, detailsAnswers);

            res.redirect(addLangToUrl(BASE_URL + PERSONAL_CODE, lang));

        }
    } catch (err) {
        logger.error("Sorry we are experiencing technical difficulties");
        const error = new ErrorService();
        error.renderErrorPage(res, locales, lang, currentUrl);
    }
};
