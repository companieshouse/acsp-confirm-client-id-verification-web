import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { selectLang, addLangToUrl, getLocalesService, getLocaleInfo } from "../utils/localise";
import { CHECK_YOUR_ANSWERS, BASE_URL, CONFIRMATION } from "../types/pageURL";
import { Session } from "@companieshouse/node-session-handler";
import { USER_DATA } from "../utils/constants";
import { ClientData } from "../model/ClientData";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const session: Session = req.session as any as Session;
    const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};

    res.render(config.CONFIRMATION, {
        previousPage: addLangToUrl(BASE_URL + CHECK_YOUR_ANSWERS, lang),
        ...getLocaleInfo(locales, lang),
        currentUrl: BASE_URL + CONFIRMATION,
        firstName: clientData?.firstName,
        lastName: clientData?.lastName
    });
};