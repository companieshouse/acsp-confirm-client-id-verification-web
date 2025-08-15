import { HelmetOptions } from "helmet";
import { CDN_HOST, PIWIK_URL, PIWIK_CHS_DOMAIN, CHS_URL, ENV_SUBDOMAIN } from "../utils/properties";

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
                formAction: formActionDirectiveDefault(),
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
                formAction: formActionDirectiveHomePage(),
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

const formActionDirectiveHomePage = () => {
    return [
        ENV_SUBDOMAIN,
        SELF,
        PIWIK_CHS_DOMAIN,
        CHS_URL
    ];
};

const formActionDirectiveDefault = () => {
    return [SELF, PIWIK_CHS_DOMAIN, CHS_URL];
};
