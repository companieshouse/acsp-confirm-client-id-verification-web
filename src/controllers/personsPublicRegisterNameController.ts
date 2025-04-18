import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { validationResult } from "express-validator";
import { formatValidationError, getPageProperties } from "../validations/validation";
import { BASE_URL, PERSONS_NAME_ON_PUBLIC_REGISTER, PERSONAL_CODE, USE_NAME_ON_PUBLIC_REGISTER, CHECK_YOUR_ANSWERS } from "../types/pageURL";
import { Session } from "@companieshouse/node-session-handler";
import { saveDataInSession } from "../utils/sessionHelper";
import { ClientData } from "../model/ClientData";
import { USER_DATA, PREVIOUS_PAGE_URL, CHECK_YOUR_ANSWERS_FLAG } from "../utils/constants";
import { selectLang, addLangToUrl, getLocalesService, getLocaleInfo } from "../utils/localise";
import { getPreviousPageUrl } from "../services/url";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const session: Session = req.session as any as Session;
        const clientData: ClientData = session.getExtraData(USER_DATA)!;
        const payload = {
            "first-name": clientData.preferredFirstName,
            "middle-names": clientData.preferredMiddleName,
            "last-name": clientData.preferredLastName
        };

        const previousPageUrl = getPreviousPageUrl(req, BASE_URL);
        saveDataInSession(req, PREVIOUS_PAGE_URL, previousPageUrl);

        const previousPage = previousPageUrl === addLangToUrl(BASE_URL + CHECK_YOUR_ANSWERS, lang)
            ? addLangToUrl(BASE_URL + CHECK_YOUR_ANSWERS, lang)
            : addLangToUrl(BASE_URL + USE_NAME_ON_PUBLIC_REGISTER, lang);

        res.render(config.PERSONS_NAME_ON_PUBLIC_REGISTER, {
            previousPage: previousPage,
            ...getLocaleInfo(locales, lang),
            currentUrl: BASE_URL + PERSONS_NAME_ON_PUBLIC_REGISTER,
            payload
        });
    } catch (error) {
        next(error);
    }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const locales = getLocalesService();
        const lang = selectLang(req.query.lang);
        const errorList = validationResult(req);
        const session: Session = req.session as any as Session;

        const previousPageUrl: string = session?.getExtraData(PREVIOUS_PAGE_URL)!;

        const previousPage = previousPageUrl === addLangToUrl(BASE_URL + CHECK_YOUR_ANSWERS, lang)
            ? addLangToUrl(BASE_URL + CHECK_YOUR_ANSWERS, lang)
            : addLangToUrl(BASE_URL + USE_NAME_ON_PUBLIC_REGISTER, lang);

        if (!errorList.isEmpty()) {
            const pageProperties = getPageProperties(formatValidationError(errorList.array(), lang));

            res.status(400).render(config.PERSONS_NAME_ON_PUBLIC_REGISTER, {
                ...getLocaleInfo(locales, lang),
                previousPage,
                currentUrl: BASE_URL + PERSONS_NAME_ON_PUBLIC_REGISTER,
                payload: req.body,
                ...pageProperties
            });
        } else {
            const clientData: ClientData = session.getExtraData(USER_DATA)!;

            clientData.preferredFirstName = req.body["first-name"];
            clientData.preferredMiddleName = req.body["middle-names"];
            clientData.preferredLastName = req.body["last-name"];

            saveDataInSession(req, USER_DATA, clientData);

            const checkYourAnswersFlag = session?.getExtraData(CHECK_YOUR_ANSWERS_FLAG);

            if (checkYourAnswersFlag) {
                res.redirect(addLangToUrl(BASE_URL + CHECK_YOUR_ANSWERS, lang));
            } else {
                res.redirect(addLangToUrl(BASE_URL + PERSONAL_CODE, lang));
            }
        }
    } catch (error) {
        next(error);
    }
};
