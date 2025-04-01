import { Session } from "@companieshouse/node-session-handler";
import { CONFIRMATION } from "../types/pageURL";

import { Request, Response, NextFunction } from "express";
import { CHECK_YOUR_ANSWERS_FLAG, USER_DATA } from "../utils/constants";

export function clearSessionAfterConfirmation (req: Request, res: Response, next: NextFunction) {
    const session: Session = req.session as any as Session;
    // Check if the user is navigating away from the confirmation page
    if (req.headers.referer?.includes(CONFIRMATION)) {

        if (req.query.lang) {
            return next();
        }
        session.deleteExtraData(USER_DATA);
        session.deleteExtraData(CHECK_YOUR_ANSWERS_FLAG);
    }
    next();
}
