import { Session } from "@companieshouse/node-session-handler";
import * as config from "../config";
import { NextFunction, Request, Response } from "express";
import { BASE_URL, CONFIRM_HOME_ADDRESS, HOME_ADDRESS, HOME_ADDRESS_MANUAL } from "../types/pageURL";
import { addLangToUrl, getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";
import { ClientData } from "../model/ClientData";
import { USER_DATA, MATOMO_BUTTON_CLICK } from "../utils/constants";
import { validationResult } from "express-validator";
import { formatValidationError, getPageProperties } from "../validations/validation";
import { AddressManualService } from "../services/addressManualService";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const session: Session = req.session as any as Session;
    const previousPage: string = addLangToUrl(BASE_URL + HOME_ADDRESS, lang);
    const currentUrl: string = BASE_URL + HOME_ADDRESS_MANUAL;
    const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};

    const addressManualService = new AddressManualService();
    const payload = addressManualService.getManualAddress(clientData);

    res.render(config.HOME_ADDRESS_MANUAL, {
        ...getLocaleInfo(locales, lang),
        previousPage,
        currentUrl,
        matomoButtonClick: MATOMO_BUTTON_CLICK,
        firstName: clientData?.firstName,
        lastName: clientData?.lastName,
        payload
    });
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const session: Session = req.session as any as Session;
    const previousPage: string = addLangToUrl(BASE_URL + HOME_ADDRESS, lang);
    const currentUrl: string = BASE_URL + HOME_ADDRESS_MANUAL;
    const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};
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
        res.redirect(addLangToUrl(BASE_URL + CONFIRM_HOME_ADDRESS, lang));
    }
};
