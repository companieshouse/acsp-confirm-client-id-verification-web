import { NextFunction, Request, Response } from "express";
import { AcspFullProfile } from "private-api-sdk-node/dist/services/acsp-profile/types";
import { getLoggedInAcspNumber } from "../utils/session";
import { getAcspFullProfile } from "../services/acspProfileService";
import { ACSP_DETAILS, ACTIVE_STATUS } from "../utils/constants";
import { Session } from "@companieshouse/node-session-handler";
import { InvalidAcspNumberError } from "@companieshouse/web-security-node";

export const acspIsActiveMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session: Session = req.session as any as Session;
        let acspDetails: AcspFullProfile = session.getExtraData(ACSP_DETAILS)!;
        const acspNumber: string = getLoggedInAcspNumber(req.session);

        if (!acspDetails) {
            acspDetails = await getAcspFullProfile(acspNumber);
            session.setExtraData(ACSP_DETAILS, acspDetails);
        }

        if (acspDetails.status !== ACTIVE_STATUS) {
            return next(new InvalidAcspNumberError(`ACSP ${acspNumber} has status ${acspDetails.status}`));
        }

        next();
    } catch (error) {
        next(error);
    }
};
