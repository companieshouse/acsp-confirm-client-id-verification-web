
# acsp-confirm-client-id-verification-web

This is a web frontend to tell Companies House you have verified/reverified someone's identity. It was created based on [Typescript Web Starter for Companies House](https://github.com/companieshouse/node-review-web-starter-ts).

The documentation of the project is available on [Confluence](https://companieshouse.atlassian.net/wiki/spaces/IDV/pages/4213178415/Workstream+5+ACSPs).

This repository contains the following web applications:

### Tell Companies House you have verified someone's identity:
(Must be a registered ACSP to access this service):

[http://chs.local/tell-companies-house-you-have-verified-someones-identity](http://chs.local/tell-companies-house-you-have-verified-someones-identity)

### Reverify someone’s identity for Companies House (Under Development):
Please note that this service is currently under development and is held behind the feature flag `FEATURE_FLAG_REVERIFY_SOMEONES_IDENTITY`

[http://chs.local/reverify-someones-identity-for-companies-house](http://chs.local/reverify-someones-identity-for-companies-house)

## Frontend technologies and utils

- [NodeJS](https://nodejs.org/)
- [ExpressJS](https://expressjs.com/)
- [Typescript](https://www.typescriptlang.org/)
- [Nunjucks](https://mozilla.github.io/nunjucks)
- [GOV.UK Design System](https://design-system.service.gov.uk/)
- [Jest](https://jestjs.io)
- [SuperTest](https://www.npmjs.com/package/supertest)
- [Git](https://git-scm.com/downloads)

## Installing and running

### Requirements

1. node v20 (engines block in package.json is used to enforce this)
2. npm v10 (engines block in package.json is used to enforce this)

Having cloned the project into the working directory, run the following commands:

```shell
cd acsp-confirm-client-id-verification-web
npm install
make clean build
```

### SSL set-up

If you wish to work with ssl-enabled endpoints locally, ensure you turn the `NODE_SSL_ENABLED` property to `ON` in the config and also provide paths to your private key and certificate.

### Running the app locally

Running the app will require the use of [companieshouse/docker-chs-development](https://github.com/companieshouse/docker-chs-development) (private repo) to bootstrap the necessary environment. Once set up, you can enable the service like so:

```shell
chs-dev modules enable acsp
chs-dev services enable acsp-confirm-client-id-verification-web
```

If you also want to enable development mode (debugging & hot reload):

```shell
chs-dev development enable acsp-confirm-client-id-verification-web
```

To start the application, run:

```shell
chs-dev up
```

...and navigate to one of the following web services:

### Tell Companies House you have verified someone's identity: 
[http://chs.local/tell-companies-house-you-have-verified-someones-identity](http://chs.local/tell-companies-house-you-have-verified-someones-identity) (or whatever hostname/port number combination you've changed the config values to)

### Reverify someone’s identity for Companies House: 
[http://chs.local/reverify-someones-identity-for-companies-house](http://chs.local/reverify-someones-identity-for-companies-house) (or whatever hostname/port number combination you've changed the config values to)

For SSL connections, navigate to https://localhost:3443

### Running the Tests

To run all tests, use the following command:

```shell
npm run test
```

To get a test coverage report, run:

```npm run test:coverage```

This will also generate a html coverage report for all tests within this repository, which can be viewed through the following project path (simply drag and drop the file onto your preferred web browser:

```acsp-confirm-client-id-verification-web/coverage/lcov-report/index.html```

# Configuration

System properties for the `acsp-confirm-client-id-verification-web`. These are normally configured per environment.

Variable| Description                                                                           |
-------------------|---------------------------------------------------------------------------------------|
ACCOUNT_URL| URL for CHS account |
ANY_PROTOCOL_CDN_HOST| Alternative CDN host that supports any protocol |
API_LOCAL_URL| Local API URL for development |
API_URL| API base URL for service interaction |
APPLICATION_NAME| Name of the application |
CACHE_SERVER| Name of the cache |
CDN_HOST| URL for the CDN |
CDN_URL_CSS| CDN URL for the CSS |
CDN_URL_JS| CDN URL for the JavaScript |
CHS_API_KEY| API key for CHS service |
CHS_INTERNAL_API_KEY| Internal API key for CHS service |
CHS_MONITOR_GUI_URL| URL for CHS monitoring GUI |
CHS_URL| Host URL for CHS |
COOKIE_DOMAIN| Domain for cookies |
COOKIE_NAME| Name for the cookie |
COOKIE_SECRET| Used for cookie encryption |
COOKIE_SECURE_ONLY| Flag to enforce secure-only cookies |
DEFAULT_SESSION_EXPIRATION| Default session expiration time in seconds |
ENV_SUBDOMAIN| Environment subdomain for service routing |
FEATURE_FLAG_ENABLE_REVERIFY_SOMEONES_IDENTITY| Feature flag for enabling Reverify someone's identity for Companies House web service (under development) |
HUMAN_LOG| Whether to produce a human-readable "pretty" log (1 or 0) |
INTERNAL_API_URL| Internal API base URL |
LOCALES_ENABLED| Flag to enable/disable localisation |
LOCALES_PATH| Path to localisation files |
LOG_LEVEL| Logging Level |
NODE_SSL_ENABLED| Flag to enable SSL for the server|
NUNJUCKS_LOADER_NO_CACHE| Flag to control the caching of templates in the Nunjucks loader|
NUNJUCKS_LOADER_WATCH| Flag to enable or disable watching for file changes in the Nunjucks loader |
PIWIK_CHS_DOMAIN| Domain URL for Matomo tracking used within the CSP |
PIWIK_EMBED| Flag to embed Matomo tracking |
PIWIK_REVERIFY_START_GOAL_ID| Goal Id for the Reverify a clients identity start button used by matomo |
PIWIK_SITE_ID| Matomo Site Id represents the environment |
PIWIK_START_GOAL_ID| Goal Id for the Verify a clients identity start button used by matomo |
PIWIK_URL| Link to the matomo dashboard |
POSTCODE_ADDRESSES_LOOKUP_URL| Host URL for Postcode Lookup service |