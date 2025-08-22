import { Request } from "express";
import { getSessionRequestWithPermission } from "../../mocks/session.mock";
import { getRedirectUrl, UrlData } from "../../../src/services/url";
import { PREVIOUS_PAGE_URL } from "../../../src/utils/constants";

describe("URL Service tests", () => {
    let req: Request;
    let config: UrlData;

    beforeEach(() => {
        const session = getSessionRequestWithPermission();
        req = {
            query: { lang: "en" },
            session: session
        } as any as Request;

        config = {
            baseUrl: "/base-url",
            checkYourAnswersUrl: "/check-your-answers",
            nextPageUrl: "/next-page-url",
            optionalNextPageUrl: "/optional-next-page-url"
        };
    });

    describe("getRedirectUrl", () => {
        it("should return check your answers URL when set in session", () => {
            const session = req.session as any;
            session.setExtraData(PREVIOUS_PAGE_URL, "/base-url/check-your-answers?lang=en");

            const result = getRedirectUrl(req, config);

            expect(result).toBe("/base-url/check-your-answers?lang=en");
        });

        it("calls session.getExtraData with PREVIOUS_PAGE_URL", () => {
            const session = req.session as any;
            const spy = jest.spyOn(session, "getExtraData");
            session.setExtraData(PREVIOUS_PAGE_URL, "/base-url/check-your-answers?lang=en");

            const result = getRedirectUrl(req, config);

            expect(spy).toHaveBeenCalledWith(PREVIOUS_PAGE_URL);
            expect(result).toBe("/base-url/check-your-answers?lang=en");
        });

        it("should return next page URL when check your answers URL is not set in session", () => {
            const session = req.session as any;
            session.setExtraData(PREVIOUS_PAGE_URL, "/some-other-page");

            const result = getRedirectUrl(req, config);

            expect(result).toBe("/base-url/next-page-url?lang=en");
        });

        it("should return next page URL when previous page URL is undefined", () => {
            const session = req.session as any;
            session.setExtraData(PREVIOUS_PAGE_URL, undefined);

            const result = getRedirectUrl(req, config);

            expect(result).toBe("/base-url/next-page-url?lang=en");
        });

        it("should return next page URL when previous page URL is null", () => {
            const session = req.session as any;
            session.setExtraData(PREVIOUS_PAGE_URL, null);

            const result = getRedirectUrl(req, config);

            expect(result).toBe("/base-url/next-page-url?lang=en");
        });

        it("should return optional next page URL when useOptionalNextPage is true and optionalNextPageUrl is provided", () => {
            const session = req.session as any;
            session.setExtraData(PREVIOUS_PAGE_URL, "/some-other-page");

            const result = getRedirectUrl(req, config, true);

            expect(result).toBe("/base-url/optional-next-page-url?lang=en");
        });

        it("should return default next page URL when useOptionalNextPage is false", () => {
            const session = req.session as any;
            session.setExtraData(PREVIOUS_PAGE_URL, "/some-other-page");

            const result = getRedirectUrl(req, config, false);

            expect(result).toBe("/base-url/next-page-url?lang=en");
        });

        it("should return default next page URL when useOptionalNextPage is true and optionalNextPageUrl is not provided", () => {
            const session = req.session as any;
            session.setExtraData(PREVIOUS_PAGE_URL, "/some-other-page");

            const configWithoutOptional = {
                baseUrl: "/base-url",
                checkYourAnswersUrl: "/check-your-answers",
                nextPageUrl: "/next-page-url"
            };

            const result = getRedirectUrl(req, configWithoutOptional, true);

            expect(result).toBe("/base-url/next-page-url?lang=en");
        });

        it("should handle undefined session gracefully", () => {
            const reqWithUndefinedSession = {
                query: { lang: "en" },
                session: undefined
            } as any as Request;

            const result = getRedirectUrl(reqWithUndefinedSession, config);

            expect(result).toBe("/base-url/next-page-url?lang=en");
        });
    });
});
