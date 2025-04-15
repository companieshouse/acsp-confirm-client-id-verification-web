import { HelmetOptions } from "helmet";
import { CDN_HOST, PIWIK_URL, PIWIK_CHS_DOMAIN, CHS_URL } from "../utils/properties";

const SELF = `'self'`;
const ONE_YEAR_SECONDS = 31536000;

export const prepareCSPConfig = (nonce: string) : HelmetOptions => {
    const NONCE = `'nonce-${nonce}'`;
    return {
        contentSecurityPolicy: {
            directives: {
                upgradeInsecureRequests: null,
                defaultSrc: [SELF],
                fontSrc: [CDN_HOST],
                imgSrc: [CDN_HOST],
                styleSrc: [NONCE, CDN_HOST],
                connectSrc: [SELF, PIWIK_URL, CHS_URL],
                formAction: formActionDirective(false),
                scriptSrc: [NONCE, CDN_HOST, PIWIK_URL],
                objectSrc: [`'none'`]
            }
        },
        referrerPolicy: {
            policy: ["same-origin"]
        },
        hsts: {
            maxAge: ONE_YEAR_SECONDS,
            includeSubDomains: true
        }
    };
};

export const prepareCSPConfigHomePage = (nonce: string) : HelmetOptions => {
    const NONCE = `'nonce-${nonce}'`;
    return {
        contentSecurityPolicy: {
            directives: {
                upgradeInsecureRequests: null,
                defaultSrc: [SELF],
                fontSrc: [CDN_HOST],
                imgSrc: [CDN_HOST],
                styleSrc: [NONCE, CDN_HOST],
                connectSrc: [SELF, PIWIK_URL, CHS_URL],
                formAction: formActionDirective(true),
                scriptSrc: [NONCE, CDN_HOST, PIWIK_URL],
                objectSrc: [`'none'`]
            }
        },
        referrerPolicy: {
            policy: ["same-origin"]
        },
        hsts: {
            maxAge: ONE_YEAR_SECONDS,
            includeSubDomains: true
        }
    };
};

const formActionDirective = (ishomepage: boolean) => {
    const ALL_CHS_URLS = "*";
    if (ishomepage) {
        return [ALL_CHS_URLS];
    } else {
        return [SELF, PIWIK_CHS_DOMAIN, CHS_URL];
    }
};
