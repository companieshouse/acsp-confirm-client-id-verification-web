import { NextFunction, Request, Response } from "express";
import { selectLang, addLangToUrl, getLocalesService, getLocaleInfo } from "../utils/localise";
import * as config from "../config";
import { BASE_URL, CHECK_YOUR_ANSWERS, CONFIRMATION, HOW_IDENTITY_DOCUMENTS_CHECKED } from "../types/pageURL";
import { USER_DATA } from "../utils/constants";
import { ClientData } from "../model/ClientData";
import { Session } from "@companieshouse/node-session-handler";
import { FormatService } from "../services/formatService";
import { validationResult } from "express-validator";
import { formatValidationError, getPageProperties } from "../validations/validation";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const previousPage: string = addLangToUrl(BASE_URL + HOW_IDENTITY_DOCUMENTS_CHECKED, lang);
    const currentUrl: string = BASE_URL + CHECK_YOUR_ANSWERS;
    const session: Session = req.session as any as Session;
    const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};

    const formattedAddress = FormatService.formatAddress(clientData.address);
    const formattedDateOfBirth = FormatService.formatDate(
        clientData.dateOfBirth ? new Date(clientData.dateOfBirth) : undefined
    );
    const formattedwhenIdentityChecksCompleted = FormatService.formatDate(
        clientData.whenIdentityChecksCompleted
            ? new Date(clientData.whenIdentityChecksCompleted)
            : undefined
    );
    const formattedDocumentsChecked = FormatService.formatDocumentsChecked(
        clientData.documentsChecked,
        locales.i18nCh.resolveNamespacesKeys(lang)
    );
    res.render(config.CHECK_YOUR_ANSWERS, {
        title: "Check your answers before sending your application",
        ...getLocaleInfo(locales, lang),
        currentUrl,
        previousPage,
        clientData: {
            ...clientData,
            address: formattedAddress,
            dateOfBirth: formattedDateOfBirth,
            whenIdentityChecksCompleted: formattedwhenIdentityChecksCompleted,
            documentsChecked: formattedDocumentsChecked
        }
    });
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const errorList = validationResult(req);
    const previousPage: string = addLangToUrl(BASE_URL + HOW_IDENTITY_DOCUMENTS_CHECKED, lang);
    const currentUrl: string = BASE_URL + CHECK_YOUR_ANSWERS;
    const session: Session = req.session as any as Session;
    const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};

    if (!errorList.isEmpty()) {
        const formattedAddress = FormatService.formatAddress(clientData.address);
        const formattedDateOfBirth = FormatService.formatDate(
            clientData.dateOfBirth ? new Date(clientData.dateOfBirth) : undefined
        );
        const formattedwhenIdentityChecksCompleted = FormatService.formatDate(
            clientData.whenIdentityChecksCompleted
                ? new Date(clientData.whenIdentityChecksCompleted)
                : undefined
        );
        const formattedDocumentsChecked = FormatService.formatDocumentsChecked(
            clientData.documentsChecked,
            locales.i18nCh.resolveNamespacesKeys(lang)
        );
        const pageProperties = getPageProperties(formatValidationError(errorList.array(), lang));
        res.status(400).render(config.CHECK_YOUR_ANSWERS, {
            title: "Check your answers before sending your application",
            previousPage,
            ...getLocaleInfo(locales, lang),
            currentUrl,
            ...pageProperties,
            clientData: {
                ...clientData,
                address: formattedAddress,
                dateOfBirth: formattedDateOfBirth,
                whenIdentityChecksCompleted: formattedwhenIdentityChecksCompleted,
                documentsChecked: formattedDocumentsChecked
            }
        });
    } else {
        res.redirect(addLangToUrl(BASE_URL + CONFIRMATION, lang));
    }
};
