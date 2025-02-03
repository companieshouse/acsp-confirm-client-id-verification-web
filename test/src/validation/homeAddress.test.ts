import mocks from "../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../src/app";
import { homeAddressValidator } from "../../../src/validations/homeAddress";
import { validationResult } from "express-validator";

jest.mock("@companieshouse/api-sdk-node");
const router = supertest(app);

describe("home Address Auto Lookup Validator", () => {
    it("Valid Address Data Should Pass Validation", async () => {
        jest.mock("../../../src/services/postcode-lookup-service", () => ({
            getUKAddressesFromPostcode: jest.fn(async (url, postcode) => {
                if (postcode === "ValidPostcode") {
                    return [{
                        postcode: "ST63LJ",
                        premise: "10",
                        addressLine1: "DOWN STREET",
                        addressLine2: "",
                        county: "south-west",
                        postTown: "LONDON",
                        country: "UNITED KINGDOM"
                    }];
                } else {
                    return [];
                }
            })
        }));

        const validAddressData = {
            postCode: "ST63LJ",
            premise: "10 "
        };

        const req = { body: validAddressData };
        const res = { locals: {} };

        for (const validationChain of homeAddressValidator) {
            await validationChain(req, res, () => {});
        }
        expect(mocks.mockSessionMiddleware).toHaveBeenCalledTimes(0);
        const errors = validationResult(req);
        expect(errors.isEmpty()).toBe(true);
    });

    it("Invalid Address Data Should Fail Validation", async () => {
        jest.mock("../../../src/services/postcode-lookup-service", () => ({
            getUKAddressesFromPostcode: jest.fn(async (url, postcode) => {
                return [];
            })
        }));

        const invalidAddressData = {
            postCode: "InvalidPostcode",
            premise: "Invalid Property Details"
        };

        const req = { body: invalidAddressData };
        const res = { locals: {} };

        for (const validationChain of homeAddressValidator) {
            await validationChain(req, res, () => {});
        }

        const errors = validationResult(req);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalledTimes(0);
        expect(errors.isEmpty()).toBe(false);
        expect(errors.array()).toHaveLength(1);
    });
});
