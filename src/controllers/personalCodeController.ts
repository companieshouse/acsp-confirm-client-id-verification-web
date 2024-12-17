import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { BASE_URL, PERSONAL_CODE, EMAIL_ADDRESS, PERSONS_NAME_ON_PUBLIC_REGISTER, USE_NAME_ON_PUBLIC_REGISTER } from "../types/pageURL";
import { Session } from "@companieshouse/node-session-handler";
import { USER_DATA, MATOMO_BUTTON_CLICK } from "../utils/constants";
import { selectLang, addLangToUrl, getLocalesService, getLocaleInfo } from "../utils/localise";
import { ClientData } from "../model/ClientData";

export const get = (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const session: Session = req.session as any as Session;
    const clientData: ClientData = session?.getExtraData(USER_DATA)!;
    const selectedOption: string = clientData?.useNameOnPublicRegister!;
    const previousPage: string = getPreviousPage(selectedOption);

    res.render(config.PERSONAL_CODE, {
        previousPage: addLangToUrl(previousPage, lang),
        ...getLocaleInfo(locales, lang),
        matomoButtonClick: MATOMO_BUTTON_CLICK,
        currentUrl: BASE_URL + PERSONAL_CODE,
        firstName: clientData?.firstName,
        lastName: clientData?.lastName
    });
};

export const post = (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    res.redirect(addLangToUrl(BASE_URL + EMAIL_ADDRESS, lang));
};

const getPreviousPage = (selectedOption: string): string => {
    if (selectedOption === "use_name_on_public_register_no") {
        return BASE_URL + PERSONS_NAME_ON_PUBLIC_REGISTER;
    } else {
        return BASE_URL + USE_NAME_ON_PUBLIC_REGISTER;
    }
};
