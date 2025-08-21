import { Handler } from "express";
import { REVERIFY_BASE_URL, REVERIFY_FEEDBACK_LINK } from "../../types/pageURL";
import { REQ_TYPE_REVERIFY, REVERIFY_SERVICE_NAME } from "../../utils/constants";

/**
 * Populates variables for use in templates that are used on multiple pages.
 * All variables in res.locals will be availble for use in templates.
 * e.g. res.locals.serviceName can be used as {{serviceName}} in the template.
 *
 * @param req http request
 * @param res http response
 * @param next the next handler in the chain
 */
export const reverifyVariablesMiddleware: Handler = (req, res, next) => {

    res.locals.serviceName = REVERIFY_SERVICE_NAME;
    res.locals.serviceUrl = REVERIFY_BASE_URL;
    res.locals.feedbackLink = REVERIFY_FEEDBACK_LINK;
    res.locals.tabTitleKey = "CommonTabTitleReverify";
    res.locals.reqType = REQ_TYPE_REVERIFY;

    next();
};
