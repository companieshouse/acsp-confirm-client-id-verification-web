import { NextFunction, Request, Response } from "express";
import { getUKAddressesFromPostcode } from "../../src/services/postcode-lookup-service";
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";

jest.mock("../../src/services/postcode-lookup-service");

const mockUKAddressesFromPostcode = getUKAddressesFromPostcode as jest.Mock;

mockUKAddressesFromPostcode.mockImplementation((req: Request, res: Response, next: NextFunction) => {
    const ukAdress : UKAddress[] = [{
        postcode: "string",
        premise: "string",
        addressLine1: "string",
        addressLine2: "string",
        postTown: "string",
        country: "string"
    }];
    return ukAdress;
});

export default mockUKAddressesFromPostcode;
