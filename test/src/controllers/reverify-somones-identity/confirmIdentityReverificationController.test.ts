import mocks from "../../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../../src/app";
import { REVERIFY_BASE_URL, REVERIFY_CHECK_YOUR_ANSWERS, REVERIFY_CONFIRM_IDENTITY_REVERIFICATION } from "../../../../src/types/pageURL";
import * as localise from "../../../../src/utils/localise";
import { sessionMiddleware } from "../../../../src/middleware/session_middleware";
import { getSessionRequestWithPermission } from "../../../mocks/session.mock";
import { USER_DATA, ACSP_DETAILS } from "../../../../src/utils/constants";
import { Request, Response, NextFunction } from "express";
import { dummyFullProfile } from "../../../mocks/acsp_profile.mock";
const router = supertest(app);

describe("GET " + REVERIFY_CONFIRM_IDENTITY_REVERIFICATION, () => {
    it("should render the confirmation page with status 200 and display the information on the screen", async () => {
        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_CONFIRM_IDENTITY_REVERIFICATION);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.status).toBe(200);
        expect(res.text).toContain("Confirm you have reverified this person&#39;s identity");
    });

    it("should show the error page if an error occurs", async () => {
        const errorMessage = "Test error";
        jest.spyOn(localise, "getLocalesService").mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_CONFIRM_IDENTITY_REVERIFICATION);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });

    it("should return status 200 when accessing page directly from check your answers URL", async () => {
        const res = await router
            .get(REVERIFY_BASE_URL + REVERIFY_CONFIRM_IDENTITY_REVERIFICATION)
            .set("Referer", REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS + "?lang=en");
        expect(res.status).toBe(200);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    });

    it("should render page with formatted date when whenIdentityChecksCompleted is provided", async () => {
        const sessionMiddlewareMock = sessionMiddleware as jest.Mock;
        sessionMiddlewareMock.mockImplementationOnce((req: Request, res: Response, next: NextFunction) => {
            const session = getSessionRequestWithPermission();
            session.setExtraData(USER_DATA, {
                firstName: "Test",
                lastName: "User",
                whenIdentityChecksCompleted: "2024-03-15",
                confirmIdentityVerified: "confirm"
            });
            session.setExtraData(ACSP_DETAILS, dummyFullProfile);
            req.session = session;
            next();
        });

        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_CONFIRM_IDENTITY_REVERIFICATION);
        expect(res.status).toBe(200);
        expect(res.text).toContain("Confirm you have reverified this person&#39;s identity");
        expect(res.text).toContain("Test User");
        expect(res.text).toContain("15 March 2024");
    });

    it("should render page without formatted date when whenIdentityChecksCompleted is not provided", async () => {
        const sessionMiddlewareMock = sessionMiddleware as jest.Mock;
        sessionMiddlewareMock.mockImplementationOnce((req: Request, res: Response, next: NextFunction) => {
            const session = getSessionRequestWithPermission();
            session.setExtraData(USER_DATA, {
                firstName: "Test",
                lastName: "User"
            });
            session.setExtraData(ACSP_DETAILS, dummyFullProfile);
            req.session = session;
            next();
        });

        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_CONFIRM_IDENTITY_REVERIFICATION);
        expect(res.status).toBe(200);
        expect(res.text).toContain("Test User");
        expect(res.text).toContain("Confirm you have reverified this person&#39;s identity");
    });

    it("should render page when session returns no user data", async () => {
        const sessionMiddlewareMock = sessionMiddleware as jest.Mock;
        sessionMiddlewareMock.mockImplementationOnce((req: Request, res: Response, next: NextFunction) => {
            const session = getSessionRequestWithPermission();
            session.getExtraData = jest.fn().mockImplementation((key: string) => {
                if (key === USER_DATA) {
                    return null;
                }
                if (key === ACSP_DETAILS) {
                    return dummyFullProfile;
                }
                return null;
            });
            req.session = session;
            next();
        });

        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_CONFIRM_IDENTITY_REVERIFICATION);
        expect(res.status).toBe(200);
        expect(res.text).toContain("Confirm you have reverified this person&#39;s identity");
    });

    it("should render page with all optional properties set in session", async () => {
        const sessionMiddlewareMock = sessionMiddleware as jest.Mock;
        sessionMiddlewareMock.mockImplementationOnce((req: Request, res: Response, next: NextFunction) => {
            const session = getSessionRequestWithPermission();
            session.setExtraData(USER_DATA, {
                firstName: "Test",
                lastName: "User",
                whenIdentityChecksCompleted: "2024-03-15",
                confirmIdentityVerified: "confirm",
                useNameOnPublicRegister: "yes",
                preferredFirstName: "Pref Test",
                preferredLastName: "Pref User"
            });
            session.setExtraData(ACSP_DETAILS, dummyFullProfile);
            req.session = session;
            next();
        });

        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_CONFIRM_IDENTITY_REVERIFICATION);
        expect(res.status).toBe(200);
        expect(res.text).toContain("Confirm you have reverified this person&#39;s identity");
        expect(res.text).toContain("Test User");
        expect(res.text).toContain("15 March 2024");
    });
});

describe("POST " + REVERIFY_CONFIRM_IDENTITY_REVERIFICATION, () => {
    it("should return status 302 after redirect", async () => {
        const sessionMiddlewareMock = sessionMiddleware as jest.Mock;
        sessionMiddlewareMock.mockImplementationOnce((req: Request, res: Response, next: NextFunction) => {
            const session = getSessionRequestWithPermission();
            const clientData = {
                firstName: "Test",
                lastName: "User",
                whenIdentityChecksCompleted: "2024-03-15"
            };
            session.setExtraData(USER_DATA, clientData);
            session.setExtraData(ACSP_DETAILS, dummyFullProfile);

            const sessionClientData = session.getExtraData.bind(session);
            session.getExtraData = jest.fn().mockImplementation((key: string) => {
                if (key === USER_DATA) {
                    return clientData;
                }
                return sessionClientData(key);
            });

            req.session = session;
            next();
        });

        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_CONFIRM_IDENTITY_REVERIFICATION).send({ declaration: "confirm" });
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS + "?lang=en");
    });

    it("should show the error page if an error occurs", async () => {
        const errorMessage = "Test error";
        jest.spyOn(localise, "getLocalesService").mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_CONFIRM_IDENTITY_REVERIFICATION);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });

    it("should return status 400 with formatted date when validation fails and whenIdentityChecksCompleted is provided", async () => {
        const sessionMiddlewareMock = sessionMiddleware as jest.Mock;
        sessionMiddlewareMock.mockImplementationOnce((req: Request, res: Response, next: NextFunction) => {
            const session = getSessionRequestWithPermission();
            session.setExtraData(USER_DATA, {
                firstName: "Test",
                lastName: "User",
                whenIdentityChecksCompleted: "2024-03-15",
                useNameOnPublicRegister: "yes",
                preferredFirstName: "Pref Test",
                preferredLastName: "Pref User"
            });
            session.setExtraData(ACSP_DETAILS, dummyFullProfile);
            req.session = session;
            next();
        });

        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_CONFIRM_IDENTITY_REVERIFICATION).send({ declaration: "" });
        expect(res.status).toBe(400);
        expect(res.text).toContain("Select to confirm you have reverified their identity");
        expect(res.text).toContain("Test User");
        expect(res.text).toContain("15 March 2024");
    });

    it("should save declaration data and redirect when form is valid", async () => {
        const sessionMiddlewareMock = sessionMiddleware as jest.Mock;
        let savedClientData: any;

        sessionMiddlewareMock.mockImplementationOnce((req: Request, res: Response, next: NextFunction) => {
            const session = getSessionRequestWithPermission();
            const clientData = {
                firstName: "Test",
                lastName: "User",
                whenIdentityChecksCompleted: "2024-03-15"
            };
            session.setExtraData(USER_DATA, clientData);
            session.setExtraData(ACSP_DETAILS, dummyFullProfile);

            const sessionClientData = session.getExtraData.bind(session);
            session.getExtraData = jest.fn().mockImplementation((key: string) => {
                if (key === USER_DATA) {
                    return clientData;
                }
                return sessionClientData(key);
            });

            req.session = session;
            savedClientData = clientData;
            next();
        });

        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_CONFIRM_IDENTITY_REVERIFICATION).send({ declaration: "confirm" });
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS + "?lang=en");
        expect(savedClientData.confirmIdentityVerified).toBe("confirm");
    });

    it("should return status 400 when validation fails with minimal client data", async () => {
        const sessionMiddlewareMock = sessionMiddleware as jest.Mock;
        sessionMiddlewareMock.mockImplementationOnce((req: Request, res: Response, next: NextFunction) => {
            const session = getSessionRequestWithPermission();
            session.setExtraData(USER_DATA, {});
            session.setExtraData(ACSP_DETAILS, dummyFullProfile);
            req.session = session;
            next();
        });

        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_CONFIRM_IDENTITY_REVERIFICATION).send({ declaration: "" });
        expect(res.status).toBe(400);
        expect(res.text).toContain("Select to confirm you have reverified their identity");
    });

    it("should handle POST when clientData is null", async () => {
        const sessionMiddlewareMock = sessionMiddleware as jest.Mock;
        sessionMiddlewareMock.mockImplementationOnce((req: Request, res: Response, next: NextFunction) => {
            const session = getSessionRequestWithPermission();
            session.getExtraData = jest.fn().mockImplementation((key: string) => {
                if (key === USER_DATA) {
                    return null;
                }
                if (key === ACSP_DETAILS) {
                    return dummyFullProfile;
                }
                return null;
            });
            req.session = session;
            next();
        });

        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_CONFIRM_IDENTITY_REVERIFICATION).send({ declaration: "confirm" });
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS + "?lang=en");
    });

    it("should render validation error with no whenIdentityChecksCompleted", async () => {
        const sessionMiddlewareMock = sessionMiddleware as jest.Mock;
        sessionMiddlewareMock.mockImplementationOnce((req: Request, res: Response, next: NextFunction) => {
            const session = getSessionRequestWithPermission();
            session.setExtraData(USER_DATA, {
                firstName: "Test",
                lastName: "User"
            });
            session.setExtraData(ACSP_DETAILS, dummyFullProfile);
            req.session = session;
            next();
        });

        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_CONFIRM_IDENTITY_REVERIFICATION).send({ declaration: "" });
        expect(res.status).toBe(400);
        expect(res.text).toContain("Select to confirm you have reverified their identity");
    });

    it("should redirect successfully when clientData is falsy", async () => {
        const sessionMiddlewareMock = sessionMiddleware as jest.Mock;
        sessionMiddlewareMock.mockImplementationOnce((req: Request, res: Response, next: NextFunction) => {
            const session = getSessionRequestWithPermission();
            session.getExtraData = jest.fn().mockImplementation((key: string) => {
                if (key === USER_DATA) {
                    return undefined;
                }
                if (key === ACSP_DETAILS) {
                    return dummyFullProfile;
                }
                return null;
            });
            req.session = session;
            next();
        });

        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_CONFIRM_IDENTITY_REVERIFICATION).send({ declaration: "confirm" });
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS + "?lang=en");
    });
});
