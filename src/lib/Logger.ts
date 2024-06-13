import { createLogger } from "@companieshouse/structured-logging-node";
import ApplicationLogger from "@companieshouse/structured-logging-node/lib/ApplicationLogger";
import { Request } from "express";

const logger: ApplicationLogger = createLogger(process.env.APP_NAME ?? "");

// tslint:disable-next-line:no-console
console.log(`env.LOG_LEVEL set to ${process.env.LOG_LEVEL}`);

export default logger;

export const createAndLogErrorRequest = (req: Request, description: string): Error => {
    const error = new Error(description);
    logger.errorRequest(req, `${error.stack}`);
    return error;
};
