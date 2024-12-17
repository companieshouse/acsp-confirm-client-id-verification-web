import { isActiveFeature } from "../../../src/utils/feature.flag";

describe("isActiveFeature", () => {
    test("returns false when flag is undefined", () => {
        expect(isActiveFeature(undefined)).toBe(false);
    });

    test("returns false when flag is \"false\"", () => {
        expect(isActiveFeature("false")).toBe(false);
    });

    test("returns false when flag is \"0\"", () => {
        expect(isActiveFeature("0")).toBe(false);
    });

    test("returns false when flag is \"off\"", () => {
        expect(isActiveFeature("off")).toBe(false);
    });

    test("returns false when flag is an empty string", () => {
        expect(isActiveFeature("")).toBe(false);
    });

    test("returns true when flag is \"true\"", () => {
        expect(isActiveFeature("true")).toBe(true);
    });

    test("returns true when flag is \"1\"", () => {
        expect(isActiveFeature("1")).toBe(true);
    });

    test("returns true when flag is \"on\"", () => {
        expect(isActiveFeature("on")).toBe(true);
    });

    test("returns true when flag is any other string", () => {
        expect(isActiveFeature("enabled")).toBe(true);
    });
});
