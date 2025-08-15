import mocks from "../../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../../src/app";
import { REVERIFY_BASE_URL, REVERIFY_PERSONAL_CODE } from "../../../../src/types/pageURL";
import * as localise from "../../../../src/utils/localise";

const router = supertest(app);

describe("Reverify Home Page tests", () => {

    describe("GET " + REVERIFY_BASE_URL, () => {
        it("should return status 200", async () => {
            const res = await router.get(REVERIFY_BASE_URL);
            await router.get(REVERIFY_BASE_URL);
            expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
            expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
            expect(mocks.mockAcspAuthenticationMiddleware).toHaveBeenCalled();
            expect(200);
            expect(res.text).toContain("Tell Companies House you have verified someone’s identity");
        });
    });

    describe("POST " + REVERIFY_BASE_URL, () => {
        it("should return status 302 after redirect with correct data", async () => {
            const res = await router.post(REVERIFY_BASE_URL);
            expect(res.status).toBe(302);
            expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
            expect(res.header.location).toBe(REVERIFY_BASE_URL + REVERIFY_PERSONAL_CODE + "?lang=en");
        });

        it("should show the error page if an error occurs", async () => {
            const errorMessage = "Test error";
            jest.spyOn(localise, "selectLang").mockImplementationOnce(() => {
                throw new Error(errorMessage);
            });
            const res = await router.post(REVERIFY_BASE_URL);
            expect(res.status).toBe(500);
            expect(res.text).toContain("Sorry we are experiencing technical difficulties");
        });
    });
});
