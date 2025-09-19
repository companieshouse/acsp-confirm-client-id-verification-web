import { NextFunction, Request, Response } from "express";
import { AcspFullProfile } from "private-api-sdk-node/dist/services/acsp-profile/types";
import { getLoggedInAcspNumber } from "../utils/session";
import { getAcspFullProfile } from "../services/acspProfileService";
import { ACSP_DETAILS, ACTIVE_STATUS } from "../utils/constants";
import { Session } from "@companieshouse/node-session-handler";
import { InvalidAcspNumberError } from "@companieshouse/web-security-node";
import { addLangToUrl, selectLang } from "../utils/localise";
import { BASE_URL, CANNOT_USE_SERVICE_WHILE_SUSPENDED, REVERIFY_BASE_URL, REVERIFY_CANNOT_USE_SERVICE_WHILE_SUSPENDED } from "../types/pageURL";

export const acspIsActiveMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = selectLang(req.query.lang);
        const session: Session = req.session as any as Session;
        let acspDetails: AcspFullProfile = session.getExtraData(ACSP_DETAILS)!;
        const acspNumber: string = getLoggedInAcspNumber(req.session);

        if (!acspDetails) {
            acspDetails = await getAcspFullProfile(acspNumber);
            session.setExtraData(ACSP_DETAILS, acspDetails);
        }

        if (acspDetails.status === "suspended") {
            const isReverifyService: boolean = req.originalUrl.includes(REVERIFY_BASE_URL);
            const cannotUseThisServiceWhileSuspendedUrl = isReverifyService ? REVERIFY_CANNOT_USE_SERVICE_WHILE_SUSPENDED : CANNOT_USE_SERVICE_WHILE_SUSPENDED;
            const baseUrl = isReverifyService ? REVERIFY_BASE_URL : BASE_URL;
            if (!req.originalUrl.includes(cannotUseThisServiceWhileSuspendedUrl)) {
                res.redirect(addLangToUrl(baseUrl + cannotUseThisServiceWhileSuspendedUrl, lang));
                return;
            }
        } else if (acspDetails.status !== ACTIVE_STATUS) {
            return next(new InvalidAcspNumberError(`ACSP ${acspNumber} has status ${acspDetails.status}`));
        }

        next();
    } catch (error) {
        next(error);
    }
};
