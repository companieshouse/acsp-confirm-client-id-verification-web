
# acsp-confirm-client-id-verification-web

This is a web frontend to tell Companies House you have verified someone’s identity. It was created based on [Typescript Web Starter for Companies House](https://github.com/companieshouse/node-review-web-starter-ts).

The documentation of the project is available on [Confluence](https://companieshouse.atlassian.net/wiki/spaces/IDV/pages/4213178415/Workstream+5+ACSPs).

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

Having cloned the project into your project root, run the following commands:

``` cd acsp-confirm-client-id-verification-web```

```npm install```

### SSL set-up

If you wish to work with ssl-enabled endpoints locally, ensure you turn the `NODE_SSL_ENABLED` property to `ON` in the config and also provide paths to your private key and certificate.

### Running the app locally

To start the application, run:

``` npm start ```

or, to watch for changes with auto restart in your dev environment, run:

``` npm run start:watch ```

...and navigate to http://localhost:3000/ (or whatever hostname/port number combination you've changed the config values to)

For SSL connections, navigate to https://localhost:3443

### Running the tests

To run the tests, type the following command:

``` npm test ```

To get a test coverage report, run:

```npm run test:coverage```
