import mocks from "../../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../../src/app";
import { REVERIFY_BASE_URL, REVERIFY_CHECK_YOUR_ANSWERS, REVERIFY_CONFIRM_IDENTITY_REVERIFICATION } from "../../../../src/types/pageURL";
import * as localise from "../../../../src/utils/localise";
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
});

describe("POST " + REVERIFY_CONFIRM_IDENTITY_REVERIFICATION, () => {
    it("should return status 302 after redirect", async () => {
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_CONFIRM_IDENTITY_REVERIFICATION).send({ declaration: "confirm" });
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS + "?lang=en");
    });

    it("should return status 400 if checkbox is not selected", async () => {
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_CONFIRM_IDENTITY_REVERIFICATION).send({ declaration: "" });
        expect(res.status).toBe(400);
        expect(res.text).toContain("Select to confirm you have reverified their identity");
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
});
