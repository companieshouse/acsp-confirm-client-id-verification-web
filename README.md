
# Typescript Web Starter for Companies House

This web-starter is designed to allow you to very quickly create a GOV_UK web app using Typescript/Node.js. It provides you with the essential building blocks (or scaffolding) for piecing together a Typescript web app and to dictate your overall project structure.

A corresponding web-starter, in native Javascript, can be found [here](https://github.com/companieshouse/node-review-web-starter-js).

#### Quick Note:

There's a **To-do** list at the bottom of this document. Please take a moment to have a quick look through at what remains to be done, and feel free to complete one or more items on this list or add items that you feel were omitted, or would be useful to have.

## Node Versions

- Before downloading and installing this project, ensure you have Node version `18.17.0` installed on your device. Version `18.x.x` should still work but `18.17.0` is recommended.

- Better still, if you use multiple versions of Node for different projects on your device, consider installing the Node Version Manager (NVM) to frictionlessly switch between Node versions for your projects.

- Visit [this resource](https://github.com/nvm-sh/nvm) to learn more about NVM, and how to install and switch between Node versions.

## Downloading and Installing

Having cloned the project into your project root, run the following commands:

``` cd node-web-starter-ts```

```npm install```

### Config Set-up

- The web-starter uses environment variables for configuration.

- The config file is located at `src/config/.env.example` and should be copied over to `src/config/.env`. This is because `.env.example` is versioned and does not contain any sensitive information whereas `.env` (which is the actual config file used by the app) is not versioned due to the fact that it may (or may not) be used to store sensitive application information e.g passwords, certificate paths, API keys, etc...

- You will need to tweak some values in `.env` to suit your local set up e.g. port number, hostname, SSL settings, etc...

- Of particular note is the `CDN_HOST` value. You may:
  - leave it empty to use locally built assets, or
  - use the `staging` or `prod` value to gain access to assets not available in your local environment e.g. vendor specific libraries like jQuery (this is because the `govuk-frontend` and `govuk_frontend_toolkit` npm packages do not ship with vendor specific libraries).
  - You can get the production value from the Platform Team or by viewing the page source of the [DevHub](https://developer.company-information.service.gov.uk/) page.
  - At the time of writing, this value is `//drv45oe4qnhl0.cloudfront.net` but can change at any time. Always ensure you have the most recent value when using it.

### SSL Set-up

- If you wish to work with ssl-enabled endpoints locally, ensure you turn the `NODE_SSL_ENABLED` property to `ON` in the config and also provide paths to your private key and certificate.

- In a typical production environment, this might never be required as the Node app usually sits behind a load balancer with SSL termination.

### Running the Tests

To run the tests, type the following command:

``` npm test ```

To get a summarised test coverage report, run:

```npm run coverage```

For a detailed test coverage report, run one of the following commands:

```npm run coverage:report```

or

```npm run test:coverage```

For these tests, we've used [Mocha](http://mochajs.org/) with [Sinon](http://sinonjs.org/) and [Chai](http://chaijs.com/).

### Running the App

To start the application, run:

``` npm start ```

or, to watch for changes with auto restart in your dev environment, run:

``` npm run start:watch ```

...and navigate to http://localhost:3000/ (or whatever hostname/port number combination you've changed the config values to)

For SSL connections, navigate to https://localhost:3443

_**A few quick notes below about the warnings you get when you start the app:**_

### Empty Directories and Files

Empty directories and files, wherever you find them, are only there for completeness -- to showcase a folder structure that you should use.

## Additional Notes

### 1. General Application Architecture

- We've opted for the Model-View-Controller design pattern that provides a clear separation of concerns, if executed correctly. This ensures that the task of scaling to a very large codebase with a small or large team(s) remains simple, transparent and minimises source bloat.
- In Node.js parlance, a controller is commonly referred to as a "router" and a controller action is called a "handler". In this starter, we use the "routers" and "handlers" naming convention as opposed to "controllers" and "actions".
- There's a router dispatch file (`./src/router.dispatch.ts`) where all router dispatch is handled i.e. incoming request routes are mapped to their pertinent routers, and consequently to the handler designed to handle that route.
- We have incorporated the concept of "atomic" handlers where all the handler logic will be neatly tucked away in separate modules without crowding out the primary router file. It also means that different developers can work on the similarly grouped tasks in the same router with little or no versioning conflicts!
- A similar approach to this is router helpers which contain routines and methods that you'd rather see obscured from the primary router file. Router helpers, if desired, can be created as a sub-folder within the main router folder, however, it might be sufficient to add all your helpers to the generic handler (`./src/routers/handlers/generic.ts`) - which exposes common methods to all handlers - without the need to use the "utilities" approach.

### 2. Application Architecture: Creating a Router

- For every router created in the routers folder (`./src/routers`), the following actions should follow:
- a corresponding sub-folder with a similar name to the router should be created in the handlers directory (`./src/routers/handlers`). All atomic handlers for this router will be housed here,
- a corresponding sub-folder with a similar name to the router should be created in the `router_views` directory (`./src/views/router_views`). This sub-folder will be used store views for the router handlers. All view names in this sub-folder should be similarly named to match the handlers they represent,
- a corresponding SASS file with a similar name to the router should be created in the sass folder (`./assets/src/scss`). This file will be used for the sass styles associated with the views (or screens) of that router,
- a corresponding Javascript file with a similar name to the router should be created in the Javascript folder (`./assets/src/js`). This file will be used for writing the browser Javascript associated with the views (or screens) of that router.
- If you anticipate this router to have screens with forms (oir payloads) that require validation, you will need to create a corresponding validation file in `./src/lib/validation/formValidators`. Again, the filename should be similar to the router name.

### 3. Application Architecture: `__global.js` and `__global.scss`

- The file `./assets/src/js/__global.js` is a Javascript file where all the browser Javascript not associated with specific router screens (or views) is written. For example, the Javascript used to enhance navigation, or enhance the header or footer, etc.. will be kept here.

- There is also a library folder (`./assets/src/js/library`) where we save all logic that is best packaged as a library module. For example, you might want to wrap all cookie logic in a single module and save it in the library folder.

- On the other hand, `./assets/src/scss/__global.scss` is a SASS file that is used to house all css style that are not associated to specific router views. For example global nav styles, or footer styles, or anything else that cuts across the service should be written here.

- The partials folder (`./assets/src/scss/partials`) could be used to a similar end - feel free to use either or both - just be mindful to exercise a reasonable degree of judiciousness while doing so.

### 4. Application Architecture: Error Handling

- In the event of errors, the handler will populate the view object (`this.viewData.errors`) with the errors thrown. For validation errors, the entire error stack will be added in this field, however, in the event of non-validation errors, this field will be populated with a generic error message.

- The view partial for errors (`./src/views/partials/error_summary.njk`) is included in every page and will only display any errors that occurred during processing at the top of the page. Have a look at the `/company/create` screen for an example.

- Additionally, the generic error partial (`./src/views/partials/error.njk`) can be used to display an unknown error on a separate page without any additional page content.

### 5. Unit Testing

- This starter kit uses Mocha, Chai and Sinon which have long been the gold standard for writing tests for Node.js apps. Another decent option is [Jest](https://jestjs.io).

### 6. Coding Standards

- Companies House follows the [StandardJS](https://standardjs.com/) coding conventions for both JavaScript and Typescript. Details about these guidelines are documented internally [here](https://github.com/companieshouse/styleguides/blob/main/javascript_node.md).



## To-do

- [x] Ensure compatibility with Node v16
- [x] Upgrade to Node v18 at appropriate time
- [x] Revise linting rule-set
- [x] Add pre-commit GIT hooks
- [x] Lock down major dependencies to specific versions that are proven to work well
- [x] Include sample page displays on start-up with CH headers, CH footers and GOV_UK error flows
- [x] Resolve all vulnerability warnings and errors flagged by `npm audit`
- [ ] ~~Bump up test coverage to meet set thresholds~~~ _This is not necessary as the code in this starter is only for illustration purposes_
- [ ] ~~Assign non-typed objects (and also replace the `any` type) with well-defined types and interfaces across class definitions and methods~~ _This is not necessary as the code in this starter is only for illustration purposes_
- [ ] ~~Add OWASP's `dependency-check` to detect publicly disclosed vulnerabilities contained within dependencies~~ _We'll be using `npm audit` to perform vulnerability checks. These checks will also be baked into all pipelines going forward._
- [ ] ~~Squelch SASS compilation deprecation warnings coming from the `govuk-frontend` toolkit. These deprecation warnings are a known issue [here](https://github.com/alphagov/govuk-frontend/issues/2238).~~ _We're using a lower version of the `sass` package to suppress these deprecation warnings that are outside of our control_  
  
