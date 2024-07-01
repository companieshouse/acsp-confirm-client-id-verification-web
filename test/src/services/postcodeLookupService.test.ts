/* eslint-disable import/first */
jest.mock("../../../src/services/apiService");
jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../../src/utils/logger");

import { createPublicApiKeyClient } from "../../../src/services/apiService";
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";
import { getUKAddressesFromPostcode, getIsValidUKPostcode, getAddressFromPostcode } from "../../../src/services/postcode-lookup-service";
import { createAndLogError } from "../../../src/utils/logger";

const mockResponseBodyOfUKAddress1: UKAddress = ({
    premise: "2",
    addressLine1: "DUNCALF STREET",
    postTown: "STOKE-ON-TRENT",
    postcode: "ST6 3LJ",
    country: "GB-ENG"
});
const mockResponseBodyOfUKAddress2: UKAddress = ({
    premise: "6",
    addressLine1: "DUNCALF STREET",
    postTown: "STOKE-ON-TRENT",
    postcode: "ST6 3LJ",
    country: "GB-ENG"
});
const mockResponseBodyOfUKAddresses: UKAddress[] = [mockResponseBodyOfUKAddress1, mockResponseBodyOfUKAddress2];

const mockCreatePublicApiKeyClient = createPublicApiKeyClient as jest.Mock;
const mockIsValidUKPostcode = jest.fn();
const mockGetUKAddressesFromPostcode = jest.fn();
mockGetUKAddressesFromPostcode.mockReturnValue("ST6 3LJ");
const mockCreateAndLogError = createAndLogError as jest.Mock;
mockCreatePublicApiKeyClient.mockReturnValue({
    postCodeLookup: {
        isValidUKPostcode: mockIsValidUKPostcode,
        getListOfValidPostcodeAddresses: mockGetUKAddressesFromPostcode
    }
});

mockCreateAndLogError.mockReturnValue(new Error());

describe("getUKAddressesFromPostcode", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should throw an error for an invalid postcode", async () => {
        const invalidPostcode = "INVALID"; // Example invalid postcode
        await expect(getUKAddressesFromPostcode("http://example.postcode.lookup/", invalidPostcode)).rejects.toThrow();
    });

    it("should return UK addresses for a valid postcode", async () => {
        mockGetUKAddressesFromPostcode.mockResolvedValueOnce({ httpStatusCode: 200, resource: mockResponseBodyOfUKAddresses });
        const result = await getUKAddressesFromPostcode("http://example.postcode.lookup/", "ST63LJ");

        expect(result).toHaveLength(2);
        expect(JSON.stringify(result[0])).toEqual(JSON.stringify(mockResponseBodyOfUKAddress1));
        expect(JSON.stringify(result[1])).toEqual(JSON.stringify(mockResponseBodyOfUKAddress2));
    });

    it("should return false when postcode is undefined", async () => {
        mockIsValidUKPostcode.mockResolvedValueOnce(undefined);
        const isValid = await getIsValidUKPostcode("http://example.postcode.lookup", "SW1A1XZ");
        expect(isValid).toBe(false);
    });
});

describe("getIsValidUKPostcode test", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("Should return true if postcode exists", async () => {
        mockIsValidUKPostcode.mockResolvedValueOnce(true);
        const responce = await getIsValidUKPostcode("http://example.postcode.lookup", "SW1A1XZ");
        expect(responce).toBe(true);
    });

    it("Should throw an error for an invalid postcode", async () => {
        mockIsValidUKPostcode.mockResolvedValueOnce(undefined);
        const responce = await getIsValidUKPostcode("http://example.postcode.lookup", "SW1A1XZ");
        expect(responce).toBe(false);
    });
});

describe("getAddressFromPostcode", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it("Should throw an error for an invalid postcode", async () => {
        const invalidPostcode = "AB12AB"; // Example Invalid postcode
        await expect(getAddressFromPostcode(invalidPostcode)).rejects.toThrow();
    });
    it("Should throw an error for no address returned", async () => {
        mockGetUKAddressesFromPostcode.mockResolvedValueOnce({ httpStatusCode: 200, resource: [] });

        await expect(getAddressFromPostcode("ST63LJ")).rejects.toThrow();
    });
    it("should return UK addresses for a valid postcode", async () => {
        mockGetUKAddressesFromPostcode.mockResolvedValueOnce({ httpStatusCode: 200, resource: mockResponseBodyOfUKAddresses });
        const result = await getAddressFromPostcode("ST63LJ");

        expect(result).toHaveLength(2);
        expect(JSON.stringify(result[0])).toEqual(JSON.stringify(mockResponseBodyOfUKAddress1));
        expect(JSON.stringify(result[1])).toEqual(JSON.stringify(mockResponseBodyOfUKAddress2));
    });
});
