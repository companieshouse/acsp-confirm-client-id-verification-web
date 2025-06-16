import { createAndLogError, initLogger as initLoggerFn } from "../../../src/utils/logger";
import { createLogger } from "@companieshouse/structured-logging-node";

const ERROR_MESSAGE = "Error: Something went wrong";

jest.mock("@companieshouse/structured-logging-node", () => ({
    createLogger: jest.fn()
}));

jest.mock("../../../src/utils/properties", () => ({
    APPLICATION_NAME: "acsp-confirm-client-id-verification-web"
}));

describe("logger tests", () => {
    const mockErrorFn = jest.fn();
    const mockLogger = {
        error: mockErrorFn
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (createLogger as jest.Mock).mockReturnValue(mockLogger);
    });

    describe("initLogger", () => {
        it("should create a logger with APP_NAME ", () => {
            const logger = initLoggerFn();
            expect(createLogger).toHaveBeenCalledWith("acsp-confirm-client-id-verification-web");
            expect(logger).toBe(mockLogger);
        });
    });

    describe("createAndLogError", () => {
        it("Should log and return an error", () => {
            const err: Error = createAndLogError(ERROR_MESSAGE);
            expect(err).toBeInstanceOf(Error);
            expect(err.message).toEqual(ERROR_MESSAGE);
            expect(mockErrorFn).toHaveBeenCalledTimes(1);
            expect(mockErrorFn).toHaveBeenCalledWith(expect.stringContaining(ERROR_MESSAGE));
        });
    });
});
