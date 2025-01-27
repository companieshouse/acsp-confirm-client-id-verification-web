/* eslint-disable indent */
import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { DATE_OF_BIRTH, HOME_ADDRESS_MANUAL, HOME_ADDRESS, BASE_URL, CHOOSE_AN_ADDRESS, CONFIRM_HOME_ADDRESS, CHECK_YOUR_ANSWERS } from "../types/pageURL";
import { addLangToUrl, getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";
import { formatValidationError, getPageProperties } from "../validations/validation";
import { ValidationError, validationResult } from "express-validator";
import { Session } from "@companieshouse/node-session-handler";
import { ClientData } from "model/ClientData";
import { AddressLookUpService } from "../services/addressLookup";
import { USER_DATA, PREVIOUS_PAGE_URL } from "../utils/constants";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const session: Session = req.session as any as Session;
    const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};

    const payload = {
        postCode: clientData.address?.postcode,
        premise: clientData.address?.propertyDetails
    };

    const previousPageUrl: string = session?.getExtraData(PREVIOUS_PAGE_URL)!;

    const previousPage = previousPageUrl === addLangToUrl(BASE_URL + CHECK_YOUR_ANSWERS, lang)
        ? addLangToUrl(BASE_URL + CHECK_YOUR_ANSWERS, lang)
        : addLangToUrl(BASE_URL + DATE_OF_BIRTH, lang);

    res.render(config.HOME_ADDRESS, {
        ...getLocaleInfo(locales, lang),
        previousPage: previousPage,
        AddressManualLink: addLangToUrl(BASE_URL + HOME_ADDRESS_MANUAL, lang),
        currentUrl: BASE_URL + HOME_ADDRESS,
        payload,
        firstName: clientData.firstName,
        lastName: clientData.lastName
    });
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const errorList = validationResult(req);
    const currentUrl = BASE_URL + HOME_ADDRESS;
    const AddressManualLink = addLangToUrl(BASE_URL + HOME_ADDRESS_MANUAL, lang);
    const session: Session = req.session as any as Session;
    const clientData: ClientData = session?.getExtraData(USER_DATA)!;

    const previousPageUrl: string = session?.getExtraData(PREVIOUS_PAGE_URL)!;

    const previousPage = previousPageUrl === addLangToUrl(BASE_URL + CHECK_YOUR_ANSWERS, lang)
        ? addLangToUrl(BASE_URL + CHECK_YOUR_ANSWERS, lang)
        : addLangToUrl(BASE_URL + DATE_OF_BIRTH, lang);

    if (!errorList.isEmpty()) {
        const pageProperties = getPageProperties(formatValidationError(errorList.array(), lang));
        res.status(400).render(config.HOME_ADDRESS, {
            ...getLocaleInfo(locales, lang),
            previousPage,
            AddressManualLink,
            currentUrl,
            payload: req.body,
            firstName: clientData?.firstName,
            lastName: clientData?.lastName,
            ...pageProperties
        });
    } else {
        const postcode = req.body.postCode;
        const inputPremise = req.body.premise;
        const addressLookUpService = new AddressLookUpService();
        await addressLookUpService.getAddressFromPostcode(req, postcode, inputPremise, clientData,
            CONFIRM_HOME_ADDRESS, CHOOSE_AN_ADDRESS).then(async (nextPageUrl) => {
                res.redirect(nextPageUrl);
            }).catch(() => {
                const validationError: ValidationError[] = [{
                    value: postcode,
                    msg: "homeAddressNoPostcodeFound",
                    param: "postCode",
                    location: "body"
                }];
                const pageProperties = getPageProperties(formatValidationError(validationError, lang));
                res.status(400).render(config.HOME_ADDRESS, {
                    previousPage,
                    ...getLocaleInfo(locales, lang),
                    currentUrl,
                    ...pageProperties,
                    payload: req.body,
                    AddressManualLink,
                    firstName: clientData?.firstName,
                    lastName: clientData?.lastName
                });
            });
    }
};
