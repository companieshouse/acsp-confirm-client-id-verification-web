import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { validationResult } from "express-validator";
import { formatValidationError, getPageProperties } from "../validations/validation";
import { BASE_URL, PERSONS_NAME, PERSONAL_CODE } from "../types/pageURL";
import { Session } from "@companieshouse/node-session-handler";
import { USER_DATA } from "../utils/constants";
import { selectLang, addLangToUrl, getLocalesService, getLocaleInfo } from "../utils/localise";
import { ClientData } from "../model/ClientData";
import { logger } from "../utils/logger";  

export const get = (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const session: Session = req.session as any as Session;
        const clientData: ClientData = session?.getExtraData(USER_DATA)!;

        logger.info(`First Name: ${clientData?.firstName}`);
        logger.info(`Last Name: ${clientData?.lastName}`);
        logger.error(clientData + " dataaaaaaa" + JSON.stringify(clientData));

        res.render(config.PERSONAL_CODE, {
            previousPage: addLangToUrl(BASE_URL + PERSONS_NAME, lang),
            ...getLocaleInfo(locales, lang),
            currentUrl: BASE_URL + PERSONAL_CODE,
            firstName: clientData?.firstName || '',
            lastName: clientData?.lastName || ''
        });
    } catch (error) {
        logger.error("Error rendering the personal code page");
        next(error);
    }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const errorList = validationResult(req);

        if (!errorList.isEmpty()) {
            const pageProperties = getPageProperties(formatValidationError(errorList.array(), lang));
            res.status(400).render(config.PERSONAL_CODE, {
                ...getLocaleInfo(locales, lang),
                previousPage: addLangToUrl(BASE_URL + PERSONS_NAME, lang),
                currentUrl: BASE_URL + PERSONAL_CODE,
                payload: req.body,
                ...pageProperties
            });
        }
};
