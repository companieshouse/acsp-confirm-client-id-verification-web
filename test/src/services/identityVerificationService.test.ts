import { Resource } from "@companieshouse/api-sdk-node";
import { Session } from "@companieshouse/node-session-handler";
import { createPrivateApiClient } from "private-api-sdk-node";
import { Identity } from "private-api-sdk-node/dist/services/identity-verification/types";
import { findIdentityByEmail } from "../../../src/services/identityVerificationService";
import { dummyIdentity } from "../../mocks/identity.mock";

jest.mock("private-api-sdk-node");

const mockCreatePrivateApiClient = createPrivateApiClient as jest.Mock;
const mockFindIdentityByEmail = jest.fn();

mockCreatePrivateApiClient.mockReturnValue({
    identityVerificationService: {
        findIdentityByEmail: mockFindIdentityByEmail
    }
});

let session;
const MOCK_EMAIL = "demo@ch.gov.uk";

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
});
