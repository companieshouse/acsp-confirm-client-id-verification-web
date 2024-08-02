import { NextFunction, Request, Response } from "express";
import { selectLang, addLangToUrl, getLocalesService, getLocaleInfo } from "../utils/localise";
import * as config from "../config";
import { BASE_URL, CHECK_YOUR_ANSWERS, CONFIRMATION } from "../types/pageURL";
import { USER_DATA } from "../utils/constants";
import { ClientData } from "../model/ClientData";
import { Session } from "@companieshouse/node-session-handler";
import { FormatService } from "../services/formatService";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const session: Session = req.session as any as Session;
    const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};

    const formattedAddress = FormatService.formatAddress(clientData.address);
    const formattedDateOfBirth = FormatService.formatDate(clientData.dateOfBirth ? new Date(clientData.dateOfBirth) : undefined);
    const formattedwhenIdentityChecksCompleted = FormatService.formatDate(clientData.whenIdentityChecksCompleted ? new Date(clientData.whenIdentityChecksCompleted) : undefined);
    const formattedDocumentsChecked = FormatService.formatBulletList(clientData.documentsChecked);
    const formattedHowIdentityDocksChecked = FormatService.formatIdentityDocChecked(clientData.howIdentityDocsChecked);
    res.render(config.CHECK_YOUR_ANSWERS, {
        title: "Check your answers before sending your application",
        ...getLocaleInfo(locales, lang),
        currentUrl: BASE_URL + CHECK_YOUR_ANSWERS,
        clientData: {
            ...clientData,
            address: formattedAddress,
            dateOfBirth: formattedDateOfBirth,
            whenIdentityChecksCompleted: formattedwhenIdentityChecksCompleted,
            documentsChecked: formattedDocumentsChecked,
            formattedHowIdentityDocksChecked: formattedHowIdentityDocksChecked
        }
    });
};

/* export const post = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = selectLang(req.query.lang);
        res.redirect(addLangToUrl(BASE_URL + CONFIRMATION, lang));
    } catch (error) {
        next(error);
    }
}; */
