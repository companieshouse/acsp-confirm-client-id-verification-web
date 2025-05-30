import type { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { CsrfError, InvalidAcspNumberError } from "@companieshouse/web-security-node";
import { ErrorService } from "../services/errorService";
import { getLocalesService, selectLang } from "../utils/localise";
import logger from "../utils/logger";

export const csrfErrorHandler: ErrorRequestHandler = (err: any, req: Request, res: Response, next:NextFunction) => {
    if (err instanceof CsrfError) {
        logger.error(`${err.name} - appError: ${err.message} - ${err.stack}`);
        const errorService = new ErrorService();
        errorService.render403Page(res, getLocalesService(), selectLang(req.query.lang), req.url);
    } else {
        next(err);
    }
};

export const acspNumberErrorHandler: ErrorRequestHandler = (err: any, req: Request, res: Response, next:NextFunction) => {
    if (err instanceof InvalidAcspNumberError) {
        logger.error(`InvalidAcspNumberError: ${err.message} - ${err.stack}`);
        const errorService = new ErrorService();
        // TODO: Update this with the correct error page once design has been approved.
        errorService.renderErrorPage(res, getLocalesService(), selectLang(req.query.lang), req.url);
    } else {
        next(err);
    }
};

export default [csrfErrorHandler, acspNumberErrorHandler];
