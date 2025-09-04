/* eslint-disable indent */
import { NextFunction, Request, Response } from "express";
import * as config from "../../config";
import {
    REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS,
    REVERIFY_DATE_OF_BIRTH,
    REVERIFY_BASE_URL,
    REVERIFY_CHECK_YOUR_ANSWERS,
    REVERIFY_HOME_ADDRESS_MANUAL,
    REVERIFY_CONFIRM_HOME_ADDRESS,
    REVERIFY_CHOOSE_AN_ADDRESS,
    REVERIFY_PERSONAL_CODE
} from "../../types/pageURL";
import { addLangToUrl, getLocaleInfo, getLocalesService, selectLang } from "../../utils/localise";
import { getPreviousPageUrl } from "../../services/url";
import { saveDataInSession } from "../../utils/sessionHelper";
import { formatValidationError, getPageProperties } from "../../validations/validation";
import { ValidationError, validationResult } from "express-validator";
import { Session } from "@companieshouse/node-session-handler";
import { ClientData } from "model/ClientData";
import { AddressLookUpService } from "../../services/addressLookup";
import { USER_DATA, PREVIOUS_PAGE_URL } from "../../utils/constants";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const session: Session = req.session as any as Session;
        const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};

        const payload = {
            postCode: clientData.address?.postcode,
            premise: clientData.address?.propertyDetails
        };

        const previousPageUrl = getPreviousPageUrl(req, REVERIFY_BASE_URL);
        saveDataInSession(req, PREVIOUS_PAGE_URL, previousPageUrl);

        const previousPage = previousPageUrl === addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang)
            ? addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang)
            : addLangToUrl(REVERIFY_BASE_URL + REVERIFY_DATE_OF_BIRTH, lang);

        res.render(config.REVERIFY_PERSONAL_CODE, {
            ...getLocaleInfo(locales, lang),
            previousPage: previousPage,
            currentUrl: REVERIFY_BASE_URL + REVERIFY_PERSONAL_CODE,
            payload,
            firstName: clientData.firstName,
            lastName: clientData.lastName
        });
    } catch (error) {
        next(error);
    }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const errorList = validationResult(req);
        const session: Session = req.session as any as Session;
        const clientData: ClientData = session?.getExtraData(USER_DATA)!;
        const currentUrl = REVERIFY_BASE_URL + REVERIFY_PERSONAL_CODE;

        const previousPageUrl = getPreviousPageUrl(req, REVERIFY_DATE_OF_BIRTH);
        saveDataInSession(req, PREVIOUS_PAGE_URL, previousPageUrl);
        const previousPage = previousPageUrl === addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang)
            ? addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang)
            : addLangToUrl(REVERIFY_BASE_URL + REVERIFY_DATE_OF_BIRTH, lang);

        if (errorList.isEmpty()) {
        } else {
            const pageProperties = getPageProperties(formatValidationError(errorList.array(), lang));
            res.status(400).render(config.REVERIFY_PERSONAL_CODE, {
                ...getLocaleInfo(locales, lang),
                previousPage,
                currentUrl,
                payload: req.body,
                firstName: clientData?.firstName,
                lastName: clientData?.lastName,
                ...pageProperties
            });
        }
    } catch (error) {
        next(error);
    }
};
