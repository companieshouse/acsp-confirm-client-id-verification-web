import { NextFunction, Request, Response } from "express";
import { BASE_URL, PROVIDE_DIFFERENT_EMAIL, EMAIL_ADDRESS } from "../types/pageURL";
import { selectLang, addLangToUrl, getLocalesService, getLocaleInfo } from "../utils/localise";
import { Session } from "@companieshouse/node-session-handler";
import { ClientData } from "model/ClientData";
import { USER_DATA } from "../utils/constants";
import * as config from "../config";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const session: Session = req.session as any as Session;
    const clientData: ClientData = session.getExtraData(USER_DATA)!;

    res.render(config.PROVIDE_DIFFERENT_EMAIL, {
        ...getLocaleInfo(getLocalesService(), lang),
        currentUrl: BASE_URL + PROVIDE_DIFFERENT_EMAIL,
        previousPage: addLangToUrl(BASE_URL + EMAIL_ADDRESS, lang),
        firstName: clientData?.firstName,
        lastName: clientData?.lastName,
        emailAddress: clientData?.emailAddress
    });
};
