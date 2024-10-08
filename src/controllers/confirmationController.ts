import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { FormatService } from "../services/formatService";
import { selectLang, addLangToUrl, getLocalesService, getLocaleInfo } from "../utils/localise";
import { CHECK_YOUR_ANSWERS, BASE_URL, CONFIRMATION } from "../types/pageURL";
import { Session } from "@companieshouse/node-session-handler";
import { REFERENCE, USER_DATA } from "../utils/constants";
import { ClientData } from "../model/ClientData";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const session: Session = req.session as any as Session;
    const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};
    const reference = session.getExtraData(REFERENCE);
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

    res.render(config.CONFIRMATION, {
        previousPage: addLangToUrl(BASE_URL + CHECK_YOUR_ANSWERS, lang),
        ...getLocaleInfo(locales, lang),
        currentUrl: BASE_URL + CONFIRMATION,
        reference,
        clientData: {
            ...clientData,
            address: formattedAddress,
            dateOfBirth: formattedDateOfBirth,
            whenIdentityChecksCompleted: formattedwhenIdentityChecksCompleted,
            documentsChecked: formattedDocumentsChecked
        }
    });
};
