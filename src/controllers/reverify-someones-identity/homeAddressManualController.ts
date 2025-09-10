import { Session } from "@companieshouse/node-session-handler";
import * as config from "../../config";
import { NextFunction, Request, Response } from "express";
import { ClientData } from "../../model/ClientData";
import { AddressManualService } from "../../services/addressManualService";
import { USER_DATA } from "../../utils/constants";
import { addLangToUrl, getLocaleInfo, getLocalesService, selectLang } from "../../utils/localise";
import { REVERIFY_CONFIRM_HOME_ADDRESS, REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS, REVERIFY_HOME_ADDRESS_MANUAL, REVERIFY_BASE_URL } from "../../types/pageURL";
import { formatValidationError, getPageProperties } from "../../validations/validation";
import { validationResult } from "express-validator";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const session: Session = req.session as any as Session;
        const previousPage: string = addLangToUrl(REVERIFY_BASE_URL + REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS, lang);
        const currentUrl: string = REVERIFY_BASE_URL + REVERIFY_HOME_ADDRESS_MANUAL;

        const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};

        const addressManualService = new AddressManualService();
        const payload = addressManualService.getManualAddress(clientData);

        res.render(config.HOME_ADDRESS_MANUAL, {
            ...getLocaleInfo(locales, lang),
            previousPage,
            currentUrl,
            firstName: clientData?.firstName,
            lastName: clientData?.lastName,
            payload
        });
    } catch (error) {
        next(error);
    }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const session: Session = req.session as any as Session;
        const previousPage: string = addLangToUrl(REVERIFY_BASE_URL + REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS, lang);
        const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};
        const currentUrl: string = REVERIFY_BASE_URL + REVERIFY_HOME_ADDRESS_MANUAL;

        const errorList = validationResult(req);

        if (!errorList.isEmpty()) {
            const pageProperties = getPageProperties(formatValidationError(errorList.array(), lang));
            res.status(400).render(config.HOME_ADDRESS_MANUAL, {
                ...getLocaleInfo(locales, lang),
                ...pageProperties,
                previousPage,
                currentUrl,
                payload: req.body,
                firstName: clientData?.firstName,
                lastName: clientData?.lastName
            });
        } else {
            const addressManualService = new AddressManualService();
            addressManualService.saveManualAddress(req, clientData);
            res.redirect(addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CONFIRM_HOME_ADDRESS, lang));
        }
    } catch (error) {
        next(error);
    }
};
