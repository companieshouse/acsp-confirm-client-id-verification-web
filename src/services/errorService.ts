import { Request, Response } from "express";
import { getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";
import { LocalesService } from "@companieshouse/ch-node-utils";
import * as config from "../config";

export class ErrorService {
    public renderErrorPage = (res:Response, locales:LocalesService, lang:string, currentUrl: string) => {
        res.status(500).render(config.ERROR_500, {
            title: "Sorry we are experiencing technical difficulties",
            ...getLocaleInfo(locales, lang),
            currentUrl: currentUrl
        });
    }

    public render404Page = (req: Request, res: Response) => {
        const locales = getLocalesService();
        const lang = selectLang(req.query.lang);
        res.status(404).render(config.ERROR_404, {
            title: "Page not found",
            ...getLocaleInfo(locales, lang),
            currentUrl: req.url
        });
    }

    public render403Page = (res:Response, locales:LocalesService, lang:string, currentUrl: string) => {
        res.status(403).render(config.ERROR_403, {
            title: "Sorry, something went wrong",
            ...getLocaleInfo(locales, lang),
            currentUrl: currentUrl
        });
    }
}
