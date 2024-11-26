import { Session } from "@companieshouse/node-session-handler";
import { Request, Response, NextFunction } from "express";
import { DETAILS_SUBMITTED } from "../utils/constants";
import { addLangToUrl, selectLang } from "../utils/localise";
import { BASE_URL, CONFIRMATION } from "../types/pageURL";

export const applicationSubmittedMiddlware = (req: Request, res: Response, next: NextFunction): unknown => {
    const lang = selectLang(req.query.lang);
    const session: Session = req.session as any as Session;
    const hasApplicationBeenSubmitted: boolean = session.getExtraData(DETAILS_SUBMITTED)!;

    if (hasApplicationBeenSubmitted) {
        res.redirect(addLangToUrl(BASE_URL + CONFIRMATION, lang));
    } else {
        return next();
    }
};
