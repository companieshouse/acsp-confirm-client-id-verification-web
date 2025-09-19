import { NextFunction, Request, Response } from "express";
import { addLangToUrl, getLocaleInfo, getLocalesService, selectLang } from "../../utils/localise";
import * as config from "../../config";
import { Session } from "@companieshouse/node-session-handler";
import { AcspFullProfile } from "private-api-sdk-node/dist/services/acsp-profile/types";
import { ACSP_DETAILS } from "../../utils/constants";
import { AUTHORISED_AGENT, REVERIFY_BASE_URL, REVERIFY_CANNOT_USE_SERVICE_WHILE_SUSPENDED } from "../../types/pageURL";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const session: Session = req.session as any as Session;
        const acspDetails: AcspFullProfile = session.getExtraData(ACSP_DETAILS)!;

        res.render(config.CANNOT_USE_SERVICE_WHILE_SUSPENDED, {
            ...getLocaleInfo(locales, lang),
            currentUrl: REVERIFY_BASE_URL + REVERIFY_CANNOT_USE_SERVICE_WHILE_SUSPENDED,
            businessName: acspDetails.name,
            authorisedAgentLink: addLangToUrl(AUTHORISED_AGENT, lang)
        });
    } catch (error) {
        next(error);
    }
};
