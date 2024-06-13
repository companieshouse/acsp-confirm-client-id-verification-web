import { ValidationError } from "express-validator";
import { getLocalesService } from "../utils/localise";

export type FormattedValidationErrors = {
    [key: string]: {
      text: string;
    },
  } & {
    errorList: {
      href: string,
      text: string,
    }[],
  };

export function formatValidationError (validationErrors: ValidationError[], lang?: string, errorMessageAlreadyResolved? : boolean | false): FormattedValidationErrors {
    const errors = { errorList: [] } as any;
    validationErrors.forEach(validationResult => {
        let errorMessage = validationResult.msg;
        if (!errorMessageAlreadyResolved) {
            errorMessage = resolveErrorMessage(errorMessage, lang);
        }
        // errors.errorList[] relates to the linked error messages at the top of the page
        errors.errorList.push({ href: "#" + validationResult.param, text: errorMessage });
        // errors[] relates to the highlighed fields and the message just above those fields
        errors[validationResult.param] = { text: errorMessage };
    });

    return errors;
}

export function resolveErrorMessage (errorMessage: string, lang?: string): string {
    const localesService = getLocalesService();
    if (lang !== undefined) {
        const error = localesService.i18nCh.resolveSingleKey("error-" + errorMessage, lang);
        if (!error.startsWith("error-")) {
            errorMessage = error;
        }
    }
    return errorMessage;
}

export const getPageProperties = (errors?: FormattedValidationErrors) => ({
    errors
});
