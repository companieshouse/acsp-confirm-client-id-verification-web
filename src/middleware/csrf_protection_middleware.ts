import { CsrfProtectionMiddleware } from "@companieshouse/web-security-node";
import { COOKIE_NAME } from "../utils/properties";
import { sessionStore } from "./session_middleware";

export const csrfProtectionMiddleware = CsrfProtectionMiddleware({
    sessionStore,
    enabled: true,
    sessionCookieName: COOKIE_NAME
});
