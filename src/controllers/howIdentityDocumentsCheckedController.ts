import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { HOW_IDENTITY_DOCUMENTS_CHECKED, WHEN_IDENTITY_CHECKS_COMPLETED, WHICH_IDENTITY_DOCS_CHECKED_GROUP1, BASE_URL, WHICH_IDENTITY_DOCS_CHECKED_GROUP2, CHECK_YOUR_ANSWERS } from "../types/pageURL";
import { addLangToUrl, getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";
import { formatValidationError, getPageProperties } from "../validations/validation";
import { validationResult } from "express-validator";
import { Session } from "@companieshouse/node-session-handler";
import { ClientData } from "model/ClientData";
import { USER_DATA, MATOMO_BUTTON_CLICK, MATOMO_RADIO_OPTION_SELECT, PREVIOUS_PAGE_URL } from "../utils/constants";
import { saveDataInSession } from "../utils/sessionHelper";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const session: Session = req.session as any as Session;
    const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};

    const previousPageUrl: string = session?.getExtraData(PREVIOUS_PAGE_URL)!;

    const previousPage = previousPageUrl === addLangToUrl(BASE_URL + CHECK_YOUR_ANSWERS, lang)
        ? addLangToUrl(BASE_URL + CHECK_YOUR_ANSWERS, lang)
        : addLangToUrl(BASE_URL + WHEN_IDENTITY_CHECKS_COMPLETED, lang);

    res.render(config.HOW_IDENTITY_DOCUMENTS_CHECKED, {
        ...getLocaleInfo(locales, lang),
        previousPage: previousPage,
        currentUrl: BASE_URL + HOW_IDENTITY_DOCUMENTS_CHECKED,
        selectedOption: clientData?.howIdentityDocsChecked,
        matomoButtonClick: MATOMO_BUTTON_CLICK,
        matomoRadioSelection: MATOMO_RADIO_OPTION_SELECT,
        firstName: clientData?.firstName,
        lastName: clientData?.lastName
    });
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const session: Session = req.session as any as Session;
    const clientData: ClientData = session?.getExtraData(USER_DATA)!;
    const errorList = validationResult(req);
    const selectedOption = req.body.howIdentityDocsCheckedRadio;
    if (!errorList.isEmpty()) {
        const previousPageUrl: string = session?.getExtraData(PREVIOUS_PAGE_URL)!;

        const previousPage = previousPageUrl === addLangToUrl(BASE_URL + CHECK_YOUR_ANSWERS, lang)
            ? addLangToUrl(BASE_URL + CHECK_YOUR_ANSWERS, lang)
            : addLangToUrl(BASE_URL + WHEN_IDENTITY_CHECKS_COMPLETED, lang);

        const pageProperties = getPageProperties(formatValidationError(errorList.array(), lang));
        res.status(400).render(config.HOW_IDENTITY_DOCUMENTS_CHECKED, {
            previousPage: previousPage,
            ...getLocaleInfo(locales, lang),
            currentUrl: BASE_URL + HOW_IDENTITY_DOCUMENTS_CHECKED,
            ...pageProperties,
            selectedOption,
            firstName: clientData?.firstName,
            lastName: clientData?.lastName
        });
    } else {
        const storedOptionSelection = clientData.howIdentityDocsChecked;
        if (storedOptionSelection !== selectedOption) {
            clientData.documentsChecked = [];
        }
        clientData.howIdentityDocsChecked = selectedOption;
        saveDataInSession(req, USER_DATA, clientData);
        if (selectedOption === "cryptographic_security_features_checked") {
            res.redirect(addLangToUrl(BASE_URL + WHICH_IDENTITY_DOCS_CHECKED_GROUP1, lang));
        } else if (selectedOption === "physical_security_features_checked") {
            res.redirect(addLangToUrl(BASE_URL + WHICH_IDENTITY_DOCS_CHECKED_GROUP2, lang));
        }
    }
};
