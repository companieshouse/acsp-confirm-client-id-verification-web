import { Handler } from "express";
import { ACCOUNT_URL, CHS_MONITOR_GUI_URL } from "../utils/properties";
import { getLoggedInAcspNumber, getLoggedInUserEmail } from "../utils/session";
import { selectLang } from "../utils/localise";

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

    const acspNumber: string = getLoggedInAcspNumber(req.session);

    // Populate user email for use in signout bar.
    const email = getLoggedInUserEmail(req.session);
    if (email !== undefined) {
        res.locals.userEmail = email;
    }

    res.locals.chsMonitorGuiUrl = CHS_MONITOR_GUI_URL;

    res.locals.accountUrl = ACCOUNT_URL;

    // Set the language for the response based on the 'lang' query parameter
    res.locals.lang = selectLang(req.query.lang);

    // Setting value for 'Authorised agent' link to show/hide on navbar
    if (acspNumber !== undefined) {
        res.locals.displayAuthorisedAgent = "yes";
    }

    next();
};
