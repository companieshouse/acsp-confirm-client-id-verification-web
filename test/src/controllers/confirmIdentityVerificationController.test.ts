import mocks from "../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../src/app";
import { BASE_URL, CONFIRM_IDENTITY_VERIFICATION, CHECK_YOUR_ANSWERS } from "../../../src/types/pageURL";
import * as localise from "../../../src/utils/localise";
const router = supertest(app);

describe("GET " + CONFIRM_IDENTITY_VERIFICATION, () => {
    it("should render the confirmation page with status 200 and display the information on the screen", async () => {
        const res = await router.get(BASE_URL + CONFIRM_IDENTITY_VERIFICATION);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.status).toBe(200);
        expect(res.text).toContain("Confirm you have verified this person&#39;s identity");
    });
    it("should show the error page if an error occurs", async () => {
        const errorMessage = "Test error";
        jest.spyOn(localise, "selectLang").mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.get(BASE_URL + CONFIRM_IDENTITY_VERIFICATION);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});

describe("POST " + CONFIRM_IDENTITY_VERIFICATION, () => {
    it("should return status 302 after redirect", async () => {
        const res = await router.post(BASE_URL + CONFIRM_IDENTITY_VERIFICATION).send({ declaration: "confirm" });
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(BASE_URL + CHECK_YOUR_ANSWERS + "?lang=en");
    });

    it("should return status 400 if checkbox is not selected", async () => {
        const res = await router.post(BASE_URL + CONFIRM_IDENTITY_VERIFICATION).send({ declaration: "" });
        expect(res.status).toBe(400);
        expect(res.text).toContain("Select to confirm you have verified their identity");
    });

    it("should show the error page if an error occurs", async () => {
        const errorMessage = "Test error";
        jest.spyOn(localise, "selectLang").mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.post(BASE_URL + CONFIRM_IDENTITY_VERIFICATION);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});
