import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { AUTHORISED_AGENT_ACCOUNT_LINK, CHECK_YOUR_ANSWERS_FLAG, REFERENCE, SERVICE_URL_LINK, USER_DATA, VERIFY_SERVICE_LINK } from "../utils/constants";
import { addLangToUrl, selectLang } from "../utils/localise";
import { AUTHORISED_AGENT, BASE_URL } from "../types/pageURL";

export const get = (req: Request, res: Response, next: NextFunction) => {
    const session = req.session as Session;
    const lang = selectLang(req.query.lang);

    // Clear session data + CYA flag
    session.deleteExtraData(USER_DATA);
    session.deleteExtraData(CHECK_YOUR_ANSWERS_FLAG);
    session.deleteExtraData(REFERENCE);

    const id = req.query.id as string;
    let redirectUrl = "";

    if (id === VERIFY_SERVICE_LINK || id === SERVICE_URL_LINK) {
        redirectUrl = BASE_URL;
    } else if (id === AUTHORISED_AGENT_ACCOUNT_LINK) {
        redirectUrl = AUTHORISED_AGENT;
    }

    // Redirect to the desired URL
    return res.redirect(addLangToUrl(redirectUrl, lang));
};
