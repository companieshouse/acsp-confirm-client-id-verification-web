import express, { NextFunction, Request, Response } from "express";
import { getGOVUKFrontendVersion } from "@companieshouse/ch-node-utils";
import * as nunjucks from "nunjucks";
import path from "path";
import logger from "./utils/logger";
import routerDispatch from "./routerDispatch";
import cookieParser from "cookie-parser";
import { authenticationMiddleware } from "./middleware/authentication_middleware";
import { ensureSessionCookiePresentMiddleware, sessionMiddleware } from "./middleware/session_middleware";
import {
    APPLICATION_NAME,
    CDN_URL_CSS,
    CDN_URL_JS,
    CHS_URL,
    PIWIK_URL,
    PIWIK_SITE_ID,
    ANY_PROTOCOL_CDN_HOST
} from "./utils/properties";
import { BASE_URL, HEALTHCHECK, ACCESSIBILITY_STATEMENT, MUST_BE_AUTHORISED_AGENT, REVERIFY_BASE_URL } from "./types/pageURL";
import { commonTemplateVariablesMiddleware } from "./middleware/common_variables_middleware";
import { getLocalesService, selectLang } from "./utils/localise";
import { ErrorService } from "./services/errorService";
import { acspAuthMiddleware } from "./middleware/acsp_authentication_middleware";
import helmet from "helmet";
import { v4 as uuidv4 } from "uuid";
import nocache from "nocache";
import { prepareCSPConfig, prepareCSPConfigHomePage } from "./middleware/content_security_policy_middleware_config";
import { csrfProtectionMiddleware } from "./middleware/csrf_protection_middleware";
import errorHandler from "./controllers/commonErrorController";
import { acspIsActiveMiddleware } from "./middleware/acsp_is_active_middleware";
import { userIsPartOfAcspMiddleware } from "./middleware/user_is_part_of_acsp_middleware";
import { verifyVariablesMiddleware } from "./middleware/verify_variables_middleware";
import { reverifyVariablesMiddleware } from "./middleware/reverify-someones-identity/reverify_variables_middleware";
const app = express();

const nonce: string = uuidv4();

const nunjucksEnv = nunjucks.configure([path.join(__dirname, "views"),
    path.join(__dirname, "/../node_modules/govuk-frontend/dist"),
    path.join(__dirname, "./node_modules/govuk-frontend/dist"),
    path.join(__dirname, "/../node_modules/@companieshouse/ch-node-utils/templates"),
    path.join(__dirname, "./node_modules/@companieshouse/ch-node-utils/templates"),
    path.join(__dirname, "/../../node_modules/@companieshouse/ch-node-utils/templates"),
    path.join(__dirname, "/../node_modules/@companieshouse"),
    path.join(__dirname, "/../../node_modules/@companieshouse"),
    path.join("./node_modules/@companieshouse")], {
    autoescape: true,
    express: app
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "njk");
nunjucksEnv.addGlobal("cdnUrlCss", CDN_URL_CSS);
nunjucksEnv.addGlobal("cdnUrlJs", CDN_URL_JS);
nunjucksEnv.addGlobal("cdnHost", ANY_PROTOCOL_CDN_HOST);
nunjucksEnv.addGlobal("govukFrontendVersion", getGOVUKFrontendVersion());
nunjucksEnv.addGlobal("govukRebrand", true);
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
app.use(nocache());

app.use(`^(${BASE_URL})$`, helmet(prepareCSPConfigHomePage(nonce)));
app.use(`^(?!(${BASE_URL}$))*`, helmet(prepareCSPConfig(nonce)));

app.use((req: Request, res: Response, next: NextFunction) => {
    res.locals.nonce = nonce;
    next();
});

app.use(`^(?!(${BASE_URL}${HEALTHCHECK}$|${BASE_URL}${ACCESSIBILITY_STATEMENT}))*`, sessionMiddleware);
app.use(`^(?!(${BASE_URL}${HEALTHCHECK}$|${BASE_URL}${ACCESSIBILITY_STATEMENT}))*`, ensureSessionCookiePresentMiddleware);
app.use(`^(?!(${BASE_URL}${HEALTHCHECK}|${BASE_URL}$|${BASE_URL}${ACCESSIBILITY_STATEMENT}))*`, csrfProtectionMiddleware);
app.use(`^(?!(${BASE_URL}${HEALTHCHECK}$|${BASE_URL}${ACCESSIBILITY_STATEMENT}))*`, authenticationMiddleware);
app.use(`^(?!(${BASE_URL}${HEALTHCHECK}$|${BASE_URL}${ACCESSIBILITY_STATEMENT}))*`, userIsPartOfAcspMiddleware);
app.use(`^(?!(${BASE_URL}${HEALTHCHECK}$|${BASE_URL}${ACCESSIBILITY_STATEMENT}$|${BASE_URL}${MUST_BE_AUTHORISED_AGENT}))*`, acspAuthMiddleware);
app.use(`^(?!(${BASE_URL}${HEALTHCHECK}$|${BASE_URL}${ACCESSIBILITY_STATEMENT}$|${BASE_URL}${MUST_BE_AUTHORISED_AGENT}))*`, acspIsActiveMiddleware);
app.use(commonTemplateVariablesMiddleware);
app.use(BASE_URL, verifyVariablesMiddleware);

// Reverify someones identity middlewares
app.use(REVERIFY_BASE_URL, reverifyVariablesMiddleware);

// Channel all requests through router dispatch
routerDispatch(app);

app.use(...errorHandler);

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
