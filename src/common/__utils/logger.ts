import { createLogger } from "@companieshouse/structured-logging-node";
import ApplicationLogger from "@companieshouse/structured-logging-node/lib/ApplicationLogger";

// tslint:disable-next-line:no-console
console.log(`env.LOG_LEVEL set to ${process.env.LOG_LEVEL}`);

export const logger: ApplicationLogger = createLogger(process.env.APP_NAME ?? "acsp-web");

export const createAndLogError = (name: string, description: string): Error => {
    const error = new Error(description);
    error.name = name;
    logger.error(`${error.stack}`);
    return error;
};
