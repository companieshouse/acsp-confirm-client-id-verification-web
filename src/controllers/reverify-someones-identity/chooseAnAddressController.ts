import { NextFunction, Request, Response } from "express";
import * as config from "../../config";
import { validationResult } from "express-validator";
import { formatValidationError, getPageProperties } from "../../validations/validation";
import { selectLang, addLangToUrl, getLocalesService, getLocaleInfo } from "../../utils/localise";
import { REVERIFY_HOME_ADDRESS_MANUAL, REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS, REVERIFY_BASE_URL, REVERIFY_CHOOSE_AN_ADDRESS, REVERIFY_CONFIRM_HOME_ADDRESS } from "../../types/pageURL";
import { Session } from "@companieshouse/node-session-handler";
import { ADDRESS_LIST, USER_DATA } from "../../utils/constants";
import { ClientData } from "model/ClientData";
import { Address } from "model/Address";
import { saveDataInSession } from "../../utils/sessionHelper";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const previousPage: string = addLangToUrl(REVERIFY_BASE_URL + REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS, lang);
        const currentUrl: string = REVERIFY_BASE_URL + REVERIFY_CHOOSE_AN_ADDRESS;
        const session: Session = req.session as any as Session;
        const addressList = session.getExtraData(ADDRESS_LIST);
        const manualAddressLink: string = addLangToUrl(REVERIFY_BASE_URL + REVERIFY_HOME_ADDRESS_MANUAL, lang);

        const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};

        res.render(config.HOME_ADDRESS_LIST, {
            ...getLocaleInfo(locales, lang),
            currentUrl,
            previousPage,
            addresses: addressList,
            manualAddressLink,
            firstname: clientData.firstName,
            lastname: clientData.lastName
        });
    } catch (error) {
        next(error);
    }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const currentUrl: string = REVERIFY_BASE_URL + REVERIFY_CHOOSE_AN_ADDRESS;
        const errorList = validationResult(req);
        const previousPage: string = addLangToUrl(REVERIFY_BASE_URL + REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS, lang);
        const session: Session = req.session as any as Session;
        const addressList: Address[] = session.getExtraData(ADDRESS_LIST)!;
        const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};
        const manualAddressLink: string = addLangToUrl(REVERIFY_BASE_URL + REVERIFY_HOME_ADDRESS_MANUAL, lang);

        if (!errorList.isEmpty()) {
            const pageProperties = getPageProperties(formatValidationError(errorList.array(), lang));
            res.status(400).render(config.HOME_ADDRESS_LIST, {
                ...getLocaleInfo(locales, lang),
                currentUrl,
                previousPage,
                addresses: addressList,
                firstname: clientData.firstName,
                lastname: clientData.lastName,
                manualAddressLink,
                pageProperties: pageProperties
            });
        } else {
            const selectPremise = req.body.homeAddress;

            // Save selected address to the session
            const homeAddress: Address = addressList.filter((address) => address.propertyDetails === selectPremise)[0];

            clientData.address = homeAddress;
            saveDataInSession(req, USER_DATA, clientData);

            const nextPageUrl = addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CONFIRM_HOME_ADDRESS, lang);
            res.redirect(nextPageUrl);
        }
    } catch (error) {
        next(error);
    }
};
