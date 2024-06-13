import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { selectLang, getLocalesService } from "../utils/localise";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    const locales = getLocalesService();
    const lang = selectLang(req.query.lang);

    res.render(config.ACCESSIBILITY_STATEMENT, {
        title: locales.i18nCh.resolveNamespacesKeys(lang).accessibilityStatementTitle
    });
};
