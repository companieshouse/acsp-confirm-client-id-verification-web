import { Request } from "express";
import { Resource } from "@companieshouse/api-sdk-node";
import { Session } from "@companieshouse/node-session-handler";
import { createPrivateApiClient } from "private-api-sdk-node";
import { Identity } from "private-api-sdk-node/dist/services/identity-verification/types";
import { IdentityVerificationService, findIdentityByEmail, sendVerifiedClientDetails } from "../../../src/services/identityVerificationService";
import { dummyIdentity, verifiedClientDetails, clientDetails, clientDetailsBiometricPassport } from "../../mocks/identity.mock";
import { createRequest, MockRequest } from "node-mocks-http";

jest.mock("private-api-sdk-node");

const mockCreatePrivateApiClient = createPrivateApiClient as jest.Mock;
const mockFindIdentityByEmail = jest.fn();
const mockSendVerifiedClientDetails = jest.fn();

mockCreatePrivateApiClient.mockReturnValue({
    identityVerificationService: {
        findIdentityByEmail: mockFindIdentityByEmail,
        sendVerifiedClientDetails: mockSendVerifiedClientDetails
    }
});

let session;
const MOCK_EMAIL = "demo@ch.gov.uk";
const createUvidType = "acsp";

describe("verification api service tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        session = new Session();
    });

    describe("findIdentityByEmail tests", () => {

        it("should return an Identity", async () => {

            mockFindIdentityByEmail.mockResolvedValueOnce({
                httpStatusCode: 200,
                resource: dummyIdentity
            } as Resource<Identity>);

            const identity = await findIdentityByEmail(MOCK_EMAIL);

            expect(identity).toStrictEqual(dummyIdentity);
        });

        it("Should throw an error when no identity-verification-api response", async () => {
            mockFindIdentityByEmail.mockResolvedValueOnce(undefined);

            await expect(findIdentityByEmail(MOCK_EMAIL)).rejects.toBe(undefined);
        });

        it("Should throw an error when identity-verification-api returns a status greater than 400 but not 404", async () => {
            mockFindIdentityByEmail.mockResolvedValueOnce({
                httpStatusCode: 400
            });

            await expect(findIdentityByEmail(MOCK_EMAIL)).rejects.toEqual({ httpStatusCode: 400 });
        });

        it("should return undefined when status code is 404", async () => {

            mockFindIdentityByEmail.mockResolvedValueOnce({
                httpStatusCode: 404,
                resource: undefined
            } as Resource<Identity>);

            const identity = await findIdentityByEmail(MOCK_EMAIL);

            expect(identity).toStrictEqual(undefined);
        });

        it("Should throw an error when identity-verification-api returns no resource", async () => {
            mockFindIdentityByEmail.mockResolvedValueOnce({
                httpStatusCode: 204
            } as Resource<Identity>);

            await expect(findIdentityByEmail(MOCK_EMAIL)).rejects.toEqual({ httpStatusCode: 204 });
        });
    });

    describe("send verified client details tests", () => {

        it("should return an Identity", async () => {

            mockSendVerifiedClientDetails.mockResolvedValueOnce({
                httpStatusCode: 200,
                resource: dummyIdentity
            } as Resource<Identity>);

            const identity = await sendVerifiedClientDetails(verifiedClientDetails);

            expect(identity).toStrictEqual(dummyIdentity);
            expect(mockSendVerifiedClientDetails).toHaveBeenCalledWith(verifiedClientDetails, createUvidType);
        });

        it("Should throw an error when no identity-verification-api response", async () => {
            mockSendVerifiedClientDetails.mockResolvedValueOnce(undefined);

            await expect(sendVerifiedClientDetails(verifiedClientDetails)).rejects.toBe(undefined);
        });

        it("Should throw an error when identity-verification-api returns a status greater than 400 but not 404", async () => {
            mockSendVerifiedClientDetails.mockResolvedValueOnce({
                httpStatusCode: 400
            });

            await expect(sendVerifiedClientDetails(verifiedClientDetails)).rejects.toEqual({ httpStatusCode: 400 });
        });

        it("should return undefined when status code is 404", async () => {

            mockSendVerifiedClientDetails.mockResolvedValueOnce({
                httpStatusCode: 404,
                resource: undefined
            } as Resource<Identity>);

            const identity = await sendVerifiedClientDetails(verifiedClientDetails);

            expect(identity).toStrictEqual(undefined);
        });

        it("Should throw an error when identity-verification-api returns no resource", async () => {
            mockSendVerifiedClientDetails.mockResolvedValueOnce({
                httpStatusCode: 204
            } as Resource<Identity>);

            await expect(sendVerifiedClientDetails(verifiedClientDetails)).rejects.toEqual({ httpStatusCode: 204 });
        });
    });

    describe("prepare verified client details tests", () => {
        let req: MockRequest<Request>;
        beforeEach(() => {
            req = createRequest({});
        });

        it("should return verified client data", async () => {

            const identityVerificationService = new IdentityVerificationService();
            const actualVerifiedClientData = identityVerificationService.prepareVerifiedClientData(clientDetails, req);

            expect(actualVerifiedClientData.email).toEqual(verifiedClientDetails.email);
            expect(actualVerifiedClientData.currentName.forenames).toEqual(verifiedClientDetails.currentName.forenames);
            expect(actualVerifiedClientData.currentName.surname).toEqual(verifiedClientDetails.currentName.surname);
            expect(actualVerifiedClientData.currentAddress.addressLine1).toEqual(verifiedClientDetails.currentAddress.addressLine1);
            expect(actualVerifiedClientData.currentAddress.addressLine2).toEqual(verifiedClientDetails.currentAddress.addressLine2);
            expect(actualVerifiedClientData.currentAddress.country).toEqual(verifiedClientDetails.currentAddress.country);
            expect(actualVerifiedClientData.currentAddress.locality).toEqual(verifiedClientDetails.currentAddress.locality);
            expect(actualVerifiedClientData.currentAddress.postalCode).toEqual(verifiedClientDetails.currentAddress.postalCode);
            expect(actualVerifiedClientData.currentAddress.premises).toEqual(verifiedClientDetails.currentAddress.premises);
            expect(actualVerifiedClientData.currentAddress.region).toEqual(verifiedClientDetails.currentAddress.region);
        });

        it("should map biometric_passport to passport in verificationEvidence", () => {
            const identityVerificationService = new IdentityVerificationService();
            const result = identityVerificationService.prepareVerifiedClientData(clientDetailsBiometricPassport, req);

            expect(result.verificationEvidence).toEqual([
                { type: "passport" }
            ]);
        });
    });
});
