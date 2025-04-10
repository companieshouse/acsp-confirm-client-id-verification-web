import { selectLang, addLangToUrl } from "../../../src/utils/localise";

describe("getLocalesService", () => {
    test("should return \"cy\" for input \"cy\"", () => {
        expect(selectLang("cy")).toBe("cy");
    });

    test("should return \"en\" for input \"en\"", () => {
        expect(selectLang("en")).toBe("en");
    });

    test("should return \"en\" for any other input", () => {
        expect(selectLang("fr")).toBe("en");
        expect(selectLang(null)).toBe("en");
        expect(selectLang(undefined)).toBe("en");
    });
});

describe("addLangToUrl", () => {
    test("should return the original URL if lang is undefined", () => {
        expect(addLangToUrl("http://example.com", undefined)).toBe("http://example.com");
    });

    test("should return the original URL if lang is an empty string", () => {
        expect(addLangToUrl("http://example.com", "")).toBe("http://example.com");
    });

    test("should append lang as a query parameter if URL has no existing query parameters", () => {
        expect(addLangToUrl("http://example.com", "en")).toBe("http://example.com?lang=en");
    });

    test("should append lang as an additional query parameter if URL already has query parameters", () => {
        expect(addLangToUrl("http://example.com?param=value", "cy")).toBe("http://example.com?param=value&lang=cy");
    });
});
