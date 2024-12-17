import { NextFunction, Request, Response } from "express";
import { acspManageUsersAuthMiddleware, AuthOptions } from "@companieshouse/web-security-node";
import { CHS_URL } from "../utils/properties";
import { getLoggedInAcspNumber } from "../utils/session";
import { BASE_URL } from "../types/pageURL";

export const acspAuthMiddleware = (req: Request, res: Response, next: NextFunction): unknown => {
    const acspNumber: string = getLoggedInAcspNumber(req.session);
    const authMiddlewareConfig: AuthOptions = {
        chsWebUrl: CHS_URL,
        returnUrl: BASE_URL,
        acspNumber
    };
    return acspManageUsersAuthMiddleware(authMiddlewareConfig)(req, res, next);
};
