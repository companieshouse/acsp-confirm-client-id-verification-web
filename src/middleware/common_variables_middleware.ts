import { Handler } from "express";
import { CHS_MONITOR_GUI_URL } from "../utils/properties";
import { getLoggedInUserEmail, getLoggedInUserId } from "../utils/session";

/**
 * Populates variables for use in templates that are used on multiple pages.
 * All variables in res.locals will be availble for use in templates.
 * e.g. res.locals.userEmail can be used as {{userEmail}} in the template.
 *
 * @param req http request
 * @param res http response
 * @param next the next handler in the chain
 */
export const commonTemplateVariablesMiddleware: Handler = (req, res, next) => {

    // Populate user email for use in signout bar.
    const email = getLoggedInUserEmail(req.session);
    if (email !== undefined) {
        res.locals.userEmail = email;
    }
    res.locals.chsMonitorGuiUrl = CHS_MONITOR_GUI_URL;
    next();
};
