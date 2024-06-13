import { Request, Response } from "express";
import { getLocaleInfo } from "../utils/localise";
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
        res.status(404).render(config.ERROR_404, {
            title: "Page not found"
        });
    }
}
