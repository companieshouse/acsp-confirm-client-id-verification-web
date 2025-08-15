import { NextFunction, Request, Response } from "express";
import { acspManageUsersAuthMiddleware, AuthOptions } from "@companieshouse/web-security-node";
import { CHS_URL } from "../utils/properties";
import { getLoggedInAcspNumber } from "../utils/session";
import { BASE_URL, REVERIFY_BASE_URL } from "../types/pageURL";

export const acspAuthMiddleware = (req: Request, res: Response, next: NextFunction): unknown => {
    const acspNumber: string = getLoggedInAcspNumber(req.session);
    // Check if the original request is for the reverify service and use this to redirect to the requested service after login
    const originalUrl = req.originalUrl;
    const isReverifyService: boolean = originalUrl.includes(REVERIFY_BASE_URL);
    const authMiddlewareConfig: AuthOptions = {
        chsWebUrl: CHS_URL,
        returnUrl: isReverifyService ? REVERIFY_BASE_URL : BASE_URL,
        acspNumber
    };
    return acspManageUsersAuthMiddleware(authMiddlewareConfig)(req, res, next);
};
