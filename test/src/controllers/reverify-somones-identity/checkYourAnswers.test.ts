import mocks from "../../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../../src/app";
import { REVERIFY_BASE_URL, REVERIFY_CHECK_YOUR_ANSWERS, REVERIFY_CONFIRMATION } from "../../../../src/types/pageURL";
import { findIdentityByEmail, sendVerifiedClientDetails } from "../../../../src/services/identityVerificationService";
import { dummyIdentity } from "../../../mocks/identity.mock";
import { sendIdentityConfirmationEmail } from "../../../../src/services/acspEmailService";
import { sessionMiddleware } from "../../../../src/middleware/session_middleware";
import { getSessionRequestWithPermission } from "../../../mocks/session.mock";
import { ACSP_DETAILS, DATA_SUBMITTED_AND_EMAIL_SENT, USER_DATA, USE_NAME_ON_PUBLIC_REGISTER_NO } from "../../../../src/utils/constants";
import { Request, Response, NextFunction } from "express";
import { dummyFullProfile } from "../../../mocks/acsp_profile.mock";
import * as localise from "../../../../src/utils/localise";
import { getAcspFullProfile } from "../../../../src/services/acspProfileService";
import { getClientFullName } from "../../../../src/controllers/reverify-someones-identity/checkYourAnswersController";
import { ClientData } from "../../../../src/model/ClientData";

jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../../../src/services/identityVerificationService.ts");
jest.mock("../../../../src/services/acspEmailService.ts");
jest.mock("../../../../src/services/acspProfileService.ts");

const mockSendVerifiedClientDetails = sendVerifiedClientDetails as jest.Mock;
const mockFindIdentityByEmail = findIdentityByEmail as jest.Mock;
const mockSendIdentityConfirmationEmail = sendIdentityConfirmationEmail as jest.Mock;
const mockGetAcspFullProfile = getAcspFullProfile as jest.Mock;

const router = supertest(app);

let customMockSessionMiddleware: any;

describe("GET" + REVERIFY_CHECK_YOUR_ANSWERS, () => {
    it("should return status 200", async () => {
        createMockSessionMiddleware();
        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS);
        expect(res.status).toBe(200);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.text).toContain("Check your answers before sending your application");
    });

    it("should return status 500 if an error occurs", async () => {
        jest.spyOn(localise, "getLocalesService").mockImplementationOnce(() => {
            throw new Error("Test error");
        });
        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });

    it("should return 302 redirect to confirmation screen if DATA_SUBMITTED_AND_EMAIL_SENT is set to true ", async () => {
        createMockSessionMiddlewareDataSubmittedAndEmailSentFlagTrue();
        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS);
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(REVERIFY_BASE_URL + REVERIFY_CONFIRMATION + "?lang=en");
    });
});

describe("POST " + REVERIFY_CHECK_YOUR_ANSWERS, () => {
    it("should return status 302 after redirect", async () => {
        createMockSessionMiddleware();
        await mockSendVerifiedClientDetails.mockResolvedValueOnce({ id: "12345" });
        await mockFindIdentityByEmail.mockResolvedValueOnce(undefined);
        await mockSendIdentityConfirmationEmail.mockResolvedValueOnce({ status: 200 });
        await mockGetAcspFullProfile.mockResolvedValueOnce({ status: "active" });
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS)
            .send({ checkYourAnswerDeclaration: "confirm" });
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(REVERIFY_BASE_URL + REVERIFY_CONFIRMATION + "?lang=en");
    });

    it("should return 302 redirect to confirmation screen if DATA_SUBMITTED_AND_EMAIL_SENT is set to true ", async () => {
        createMockSessionMiddlewareDataSubmittedAndEmailSentFlagTrue();
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS)
            .send({ checkYourAnswerDeclaration: "confirm" });
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(REVERIFY_BASE_URL + REVERIFY_CONFIRMATION + "?lang=en");
    });

    it("should return status 500 and render the error screen if email has already been verified", async () => {
        createMockSessionMiddleware();
        await mockSendVerifiedClientDetails.mockResolvedValueOnce(undefined);
        await mockFindIdentityByEmail.mockResolvedValueOnce(dummyIdentity);
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS).send({
            address: "Flat 1 Baker Street<br>Second Floor<br>London<br>Greater London<br>United Kingdom<br>NW1 6XE",
            dateOfBirth: "07 July 1998",
            whenIdentityChecksCompleted: "07 July 2024",
            documentsChecked: "• Biometric or machine readable passport<br>• Irish passport card",
            checkYourAnswerDeclaration: "confirm"
        });
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });

    it("should return status 500 if verification api errors", async () => {
        await mockFindIdentityByEmail.mockRejectedValueOnce(new Error("Email address already exists"));
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS).send({ checkYourAnswerDeclaration: "confirm" });
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });

    it("should return status 500 when the ACSP is ceased", async () => {
        createMockSessionMiddleware();
        await mockFindIdentityByEmail.mockResolvedValueOnce(undefined);
        await mockGetAcspFullProfile.mockResolvedValueOnce({ status: "ceased" });
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS)
            .send({ checkYourAnswerDeclaration: "confirm" });
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });

    it("should return status 500 if an error occurs", async () => {
        jest.spyOn(localise, "getLocalesService").mockImplementationOnce(() => {
            throw new Error("Test error");
        });
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});

describe("getClientFullName", () => {
    describe("when useNameOnPublicRegister is USE_NAME_ON_PUBLIC_REGISTER_NO", () => {
        it("should return the preferred first and last name", () => {
            const clientData: ClientData = {
                firstName: "John",
                lastName: "Doe",
                preferredFirstName: "Johnny",
                preferredLastName: "Smith",
                useNameOnPublicRegister: USE_NAME_ON_PUBLIC_REGISTER_NO
            };

            const result = getClientFullName(clientData);

            expect(result).toBe("Johnny Smith");
        });
    });

    describe("when useNameOnPublicRegister is not USE_NAME_ON_PUBLIC_REGISTER_NO", () => {
        it("should return the first and last name", () => {
            const clientData: ClientData = {
                firstName: "John",
                lastName: "Doe",
                preferredFirstName: "Johnny",
                preferredLastName: "Smith",
                useNameOnPublicRegister: "use_name_on_public_register_yes"
            };

            const result = getClientFullName(clientData);

            expect(result).toBe("John Doe");
        });
    });
});

function createMockSessionMiddleware () {
    customMockSessionMiddleware = sessionMiddleware as jest.Mock;
    const session = getSessionRequestWithPermission();
    session.setExtraData(USER_DATA, {
        idDocumentDetails: [
            {
                docName: "passport",
                documentNumber: "123456789",
                expiryDate: new Date("2030-01-01"),
                countryOfIssue: "UK"
            }
        ]
    });
    session.setExtraData(ACSP_DETAILS, dummyFullProfile);
    customMockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
        req.session = session;
        next();
    });
}

function createMockSessionMiddlewareDataSubmittedAndEmailSentFlagTrue () {
    customMockSessionMiddleware = sessionMiddleware as jest.Mock;
    const session = getSessionRequestWithPermission();
    session.setExtraData(DATA_SUBMITTED_AND_EMAIL_SENT, true);
    customMockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
        req.session = session;
        next();
    });
}
