import ApplicationLogger from "@companieshouse/structured-logging-node/lib/ApplicationLogger";
import { createAndLogError, logger } from "../../../src/utils/logger";

const ERROR_MESSAGE = "Error: Something went wrong";

logger.error = jest.fn();

describe("logger tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("Should test the logger object is defined of type ApplicationLogger", () => {
        expect(logger).toBeDefined();
        expect(logger).toBeInstanceOf(ApplicationLogger);
    });

    test("Should log and return an error", () => {
        const err: Error = createAndLogError(ERROR_MESSAGE);
        expect(err.message).toEqual(ERROR_MESSAGE);
        expect(logger.error).toHaveBeenCalledTimes(1);
    });
});
