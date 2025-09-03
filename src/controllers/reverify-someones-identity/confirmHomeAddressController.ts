import { NextFunction, Request, Response } from "express";
import * as config from "../../config";
import { selectLang, addLangToUrl, getLocalesService, getLocaleInfo } from "../../utils/localise";
import { REVERIFY_BASE_URL, REVERIFY_HOME_ADDRESS_MANUAL, REVERIFY_CONFIRM_HOME_ADDRESS, REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS, REVERIFY_CHECK_YOUR_ANSWERS, REVERIFY_WHEN_IDENTITY_CHECKS_COMPLETED } from "../../types/pageURL";
import { Session } from "@companieshouse/node-session-handler";
import { USER_DATA, MATOMO_LINK_CLICK, CHECK_YOUR_ANSWERS_FLAG } from "../../utils/constants";
import { ClientData } from "model/ClientData";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const session: Session = req.session as any as Session;
        const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};

        res.render(config.CONFIRM_HOME_ADDRESS, {
            previousPage: addLangToUrl(REVERIFY_BASE_URL + REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS, lang),
            editPage: addLangToUrl(REVERIFY_BASE_URL + REVERIFY_HOME_ADDRESS_MANUAL, lang),
            ...getLocaleInfo(locales, lang),
            currentUrl: REVERIFY_BASE_URL + REVERIFY_CONFIRM_HOME_ADDRESS,
            matomoLinkClick: MATOMO_LINK_CLICK,
            address: clientData?.address,
            firstName: clientData?.firstName,
            lastName: clientData?.lastName
        });
    } catch (error) {
        next(error);
    }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session: Session = req.session as any as Session;
        const lang = selectLang(req.query.lang);

        const checkYourAnswersFlag = session?.getExtraData(CHECK_YOUR_ANSWERS_FLAG);

        if (checkYourAnswersFlag) {
            res.redirect(addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang));
        } else {
            res.redirect(addLangToUrl(REVERIFY_BASE_URL + REVERIFY_WHEN_IDENTITY_CHECKS_COMPLETED, lang));
        }
    } catch (error) {
        next(error);
    }
};
