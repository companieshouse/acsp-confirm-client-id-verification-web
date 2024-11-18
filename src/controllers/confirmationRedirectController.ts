import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { CHECK_YOUR_ANSWERS_FLAG, USER_DATA } from "../utils/constants";
import { addLangToUrl, selectLang } from "../utils/localise";
import { BASE_URL } from "../types/pageURL";

export const get = (req: Request, res: Response, next: NextFunction) => {
    const session = req.session as Session;
    const lang = selectLang(req.query.lang);

    // Clear session data + CYA flag
    session.deleteExtraData(USER_DATA);
    session.deleteExtraData(CHECK_YOUR_ANSWERS_FLAG);

    const id = req.query.id as string;
    let redirectUrl = "";

    if (id === "verify-service-link") {
        redirectUrl = BASE_URL;
    } else if (id === "authorised-agent-account-link") {
        // authorised agent link placeholder - need to update later
        redirectUrl = "#";
    }

    // Redirect to the desired URL
    return res.redirect(addLangToUrl(redirectUrl, lang));
};
