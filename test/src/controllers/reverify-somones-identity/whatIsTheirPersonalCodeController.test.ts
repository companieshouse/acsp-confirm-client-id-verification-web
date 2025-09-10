import mocks from "../../../mocks/all_middleware_mock";
import app from "../../../../src/app";
import supertest from "supertest";
import { REVERIFY_BASE_URL, REVERIFY_PERSONAL_CODE, REVERIFY_EMAIL_ADDRESS } from "../../../../src/types/pageURL";
import * as localise from "../../../../src/utils/localise";
import * as urlService from "../../../../src/services/url";

const router = supertest(app);

describe("What is their personal code GET", () => {

    it("Should return the status 200", async () => {
        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_PERSONAL_CODE);
        expect(res.status).toBe(200);
        expect(res.text).toContain("What is their personal code?");
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
    });

    it("Back button test", async () => {
        jest.spyOn(urlService, "getPreviousPageUrl").mockReturnValue(REVERIFY_BASE_URL);
        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_PERSONAL_CODE);
        expect(res.text).toContain(REVERIFY_BASE_URL + "?lang=en");
    });

    it("Shuld handle the error", async () => {
        const errorMessage = "Test error";
        jest.spyOn(localise, "getLocalesService").mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_PERSONAL_CODE);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});

describe("What is their personal code POST", () => {

    it("Should show a validation error when the personal code is empty", async () => {
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_PERSONAL_CODE).send({ personalCode: "" });
        expect(res.text).toContain("Enter their personal code");
        expect(res.status).toBe(400);
    });

    it("Validation test for the invalid format", async () => {
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_PERSONAL_CODE).send({ personalCode: "A1B-2H3D-4E5F-" });
        expect(res.text).toContain("Enter a valid personal code");
    });

    it("Should display the error page if an error occurs", async () => {
        const errorMessage = "Test error";
        jest.spyOn(localise, "getLocalesService").mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_PERSONAL_CODE);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});
