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
            nextPageUrl: "/next-page-url"
        };
    });

    describe("getRedirectUrl", () => {
        it("should return check your answers URL when set in session", () => {
            const session = req.session as any;
            session.setExtraData(PREVIOUS_PAGE_URL, "/base-url/check-your-answers?lang=en");

            const result = getRedirectUrl(req, config);

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

        it("should return next page URL when session is null", () => {
            req.session = null as any;

            const result = getRedirectUrl(req, config);

            expect(result).toBe("/base-url/next-page-url?lang=en");
        });

        it("should return next page URL when session is undefined", () => {
            req.session = undefined as any;

            const result = getRedirectUrl(req, config);

            expect(result).toBe("/base-url/next-page-url?lang=en");
        });
    });
});
