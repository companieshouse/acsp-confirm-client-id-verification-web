import express, { NextFunction, Request, Response } from "express";
import * as nunjucks from "nunjucks";
import path from "path";
import logger from "./lib/Logger";
import routerDispatch from "./router.dispatch";
import cookieParser from "cookie-parser";
import { authenticationMiddleware } from "./middleware/authentication_middleware";
import { sessionMiddleware } from "./middleware/session_middleware";

import {
    APPLICATION_NAME,
    CDN_URL_CSS,
    CDN_URL_JS,
    CDN_HOST,
    CHS_URL,
    PIWIK_URL,
    PIWIK_SITE_ID
} from "./utils/properties";
import { BASE_URL, HEALTHCHECK, ACCESSIBILITY_STATEMENT, CONFIRMATION, CONFIRMATION_REDIRECT } from "./types/pageURL";
import { commonTemplateVariablesMiddleware } from "./middleware/common_variables_middleware";
import { getLocalesService, selectLang } from "./utils/localise";
import { ErrorService } from "./services/errorService";
import { acspAuthMiddleware } from "./middleware/acsp_authentication_middleware";
import { applicationSubmittedMiddlware } from "./middleware/application_submitted_middleware";
const app = express();

const nunjucksEnv = nunjucks.configure([path.join(__dirname, "views"),
    path.join(__dirname, "/../node_modules/govuk-frontend"),
    path.join(__dirname, "./node_modules/govuk-frontend"),
    path.join(__dirname, "/../node_modules/@companieshouse/ch-node-utils/templates"),
    path.join(__dirname, "./node_modules/@companieshouse/ch-node-utils/templates")], {
    autoescape: true,
    express: app
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "njk");
nunjucksEnv.addGlobal("cdnUrlCss", CDN_URL_CSS);
nunjucksEnv.addGlobal("cdnUrlJs", CDN_URL_JS);
nunjucksEnv.addGlobal("cdnHost", CDN_HOST);
nunjucksEnv.addGlobal("chsUrl", CHS_URL);
nunjucksEnv.addGlobal("SERVICE_NAME", APPLICATION_NAME);

nunjucksEnv.addGlobal("PIWIK_URL", PIWIK_URL);
nunjucksEnv.addGlobal("PIWIK_SITE_ID", PIWIK_SITE_ID);
nunjucksEnv.addGlobal("PIWIK_EMBED", PIWIK_SITE_ID);

app.enable("trust proxy");

// parse body into req.body
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Serve static files
app.use(express.static(path.join(__dirname, "/../assets/public")));

// Apply middleware
app.use(cookieParser());
app.use(`^(?!(${BASE_URL}${HEALTHCHECK}$|${BASE_URL}${ACCESSIBILITY_STATEMENT}))*`, sessionMiddleware);
app.use(`^(?!(${BASE_URL}${HEALTHCHECK}$|${BASE_URL}${ACCESSIBILITY_STATEMENT}))*`, authenticationMiddleware);
app.use(`^(?!(${BASE_URL}${HEALTHCHECK}$|${BASE_URL}${ACCESSIBILITY_STATEMENT}))*`, acspAuthMiddleware);
app.use(`^(?!(${BASE_URL}${HEALTHCHECK}|${BASE_URL}${CONFIRMATION}|${BASE_URL}${CONFIRMATION_REDIRECT}$|${BASE_URL}${ACCESSIBILITY_STATEMENT}))*`, applicationSubmittedMiddlware);
app.use(commonTemplateVariablesMiddleware);

// Channel all requests through router dispatch
routerDispatch(app);

// Unhandled errors
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(`${err.name} - appError: ${err.message} - ${err.stack}`);
    const errorService = new ErrorService();
    errorService.renderErrorPage(res, getLocalesService(), selectLang(req.query.lang), req.url);
});

// Unhandled exceptions
process.on("uncaughtException", (err: any) => {
    logger.error(`${err.name} - uncaughtException: ${err.message} - ${err.stack}`);
    process.exit(1);
});

// Unhandled promise rejections
process.on("unhandledRejection", (err: any) => {
    logger.error(`${err.name} - unhandledRejection: ${err.message} - ${err.stack}`);
    process.exit(1);
});

export default app;
