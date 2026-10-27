
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

1. node v24 (engines block in package.json is used to enforce this)
2. npm v11 (engines block in package.json is used to enforce this)

Having cloned the project into your project root, run the following commands:

``` cd acsp-confirm-client-id-verification-web```

```npm install```

### SSL set-up

If you wish to work with ssl-enabled endpoints locally, ensure you turn the `NODE_SSL_ENABLED` property to `ON` in the config and also provide paths to your private key and certificate.

### Running the app locally with docker-chs-development

Running the app requires [companieshouse/docker-chs-development](https://github.com/companieshouse/docker-chs-development) (private repo) to provide the services it depends on. Once that is set up, enable the service:

```shell
chs-dev services enable acsp-confirm-client-id-verification-web
```

Enabling the service also starts the services it depends on: `eric`, `authentication-service`, `ch-gov-uk`, `cdn-ch-gov-uk`, `identity-verification-api` and `acsp-manage-users-api`. To run all ACSP services, run `chs-dev modules enable acsp` instead.

To enable development mode, which runs the service from your local clone with hot reload (`npm run chs-dev`) and debugging, run:

```shell
chs-dev development enable acsp-confirm-client-id-verification-web
```

In development mode the Node debugger is exposed on `localhost:9227`.

To start the environment, run:

```shell
chs-dev up
```

Run `chs-dev status` to check what is running. Run `chs-dev down` to stop it.

### Start URLs

| Journey | URL |
|---|---|
| Tell Companies House you have verified someone's identity | [http://chs.local/tell-companies-house-you-have-verified-someones-identity](http://chs.local/tell-companies-house-you-have-verified-someones-identity) |
| Reverify someone's identity (behind `FEATURE_FLAG_ENABLE_REVERIFY_SOMEONES_IDENTITY`, enabled in docker-chs-development) | [http://chs.local/reverify-someones-identity-for-companies-house](http://chs.local/reverify-someones-identity-for-companies-house) |
| Health check (no sign-in needed) | [http://chs.local/tell-companies-house-you-have-verified-someones-identity/healthcheck](http://chs.local/tell-companies-house-you-have-verified-someones-identity/healthcheck) |

Add `?lang=cy` to any page to view it in Welsh.

### Getting the web journey working locally

Every page except the health check and accessibility statement runs these checks in order:

1. **You must be signed in.** If you're not signed in, you are redirected to the CHS sign-in page (`http://chs.local/signin`) and returned to the start URL afterwards.
2. **The account must be a member of an ACSP.** The ACSP number is read from the session's sign-in information, which comes from `acsp-manage-users-api` (the `acsp_members` Mongo database). If the account is not a member, you are redirected to `/must-be-authorised-agent`.
3. **You must be authorised for that ACSP.** This is checked by `acsp-manage-users-api`.
4. **The ACSP must be active.** The profile is fetched from the ACSP profile API. If the ACSP is `suspended`, you are redirected to `/cannot-use-service-while-suspended`. Any status other than `active` shows the error page.

So you need a local user who is a member of an **active** ACSP. You can get one by:

- registering an ACSP through [acsp-web](https://github.com/companieshouse/acsp-web) (`chs-dev modules enable acsp`, then go to [http://chs.local/register-as-companies-house-authorised-agent](http://chs.local/register-as-companies-house-authorised-agent)), or
- inserting a membership in the `acsp_members` database and an active ACSP profile for the same ACSP number into the local Mongo instance.

After changing membership data, sign out and back in so the session picks up the ACSP number.

Other tips:

- **Unstyled pages:** CSS and JS are loaded from `http://cdn.chs.local`, so check `cdn-ch-gov-uk` is running.
- **Unexpected errors:** check the logs with `docker logs -f acsp-confirm-client-id-verification-web`. Most problems come from a missing ACSP profile or membership.
- **Environment variables:** the variables used locally are set in `services/modules/acsp/acsp-confirm-client-id-verification-web.docker-compose.yaml` in docker-chs-development.

### Running the app outside docker-chs-development

To build and start the application directly, run:

``` npm start ```

or, to watch for changes with auto restart, run:

``` npm run start:watch ```

The app listens on http://localhost:3000. It still needs the services listed above, so in practice docker-chs-development is the easiest way to run it.

For SSL connections, navigate to https://localhost:3443

### Building the assets

`npm run build:assets` (also run by `npm run build`) uses `scripts/build-assets.js` to compile `assets/src/scss` into `assets/public/css/app.min.css` and minify `assets/src/js` into `assets/public/js/app.min.js`.

### Running the tests

To run the tests, type the following command:

``` npm test ```

To get a test coverage report, run:

```npm run test:coverage```
