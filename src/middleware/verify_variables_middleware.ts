import { Handler } from "express";
import { BASE_URL, VERIFY_FEEDBACK_LINK } from "../types/pageURL";
import { VERIFY_SERVICE_NAME } from "../utils/constants";

/**
 * Populates variables for use in templates that are used on multiple pages.
 * All variables in res.locals will be availble for use in templates.
 * e.g. res.locals.serviceName can be used as {{serviceName}} in the template.
 *
 * @param req http request
 * @param res http response
 * @param next the next handler in the chain
 */
export const verifyVariablesMiddleware: Handler = (req, res, next) => {

    res.locals.serviceName = VERIFY_SERVICE_NAME;
    res.locals.serviceUrl = BASE_URL;
    res.locals.tabTitleKey = "CommonTabTitleVerify";
    res.locals.feedbackLink = VERIFY_FEEDBACK_LINK;

    next();
};
