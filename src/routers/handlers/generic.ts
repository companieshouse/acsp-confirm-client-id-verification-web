// Generic handler is the base handler that is extended by all other handlers
// It contains methods that are common to multiple route handlers

import errorManifest from "./../../lib/utils/error_manifests/default";

export class GenericHandler {

    viewData: any;
    errorManifest: any;

    constructor () {
        this.errorManifest = errorManifest;
        this.viewData = {
            errors: {}
        };
    }

    processHandlerException (err: any): Object {
        if (err.name === "VALIDATION_ERRORS") {
            return err.stack;
        }
        return {
            serverError: this.errorManifest.generic.serverError
        };
    }

    someCommonMethod (): Object {
        return {};
    }
};
