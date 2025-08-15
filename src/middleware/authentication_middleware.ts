import { NextFunction, Request, Response } from "express";
import { authMiddleware, AuthOptions } from "@companieshouse/web-security-node";
import { CHS_URL } from "../utils/properties";
import { BASE_URL, REVERIFY_BASE_URL } from "../types/pageURL";

export const authenticationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Check if the original request is for the reverify service and use this to redirect to the requested service after login
    const originalUrl = req.originalUrl;
    const isReverifyService: boolean = originalUrl.includes(REVERIFY_BASE_URL);

    const authMiddlewareConfig: AuthOptions = {
        chsWebUrl: CHS_URL,
        returnUrl: isReverifyService ? REVERIFY_BASE_URL : BASE_URL
    };
    return authMiddleware(authMiddlewareConfig)(req, res, next);
};
