import mocks from "../../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../../src/app";
import { REVERIFY_BASE_URL, REVERIFY_PERSONAL_CODE_IS_INVALID } from "../../../../src/types/pageURL";
import * as localise from "../../../../src/utils/localise";

const router = supertest(app);

describe("GET " + REVERIFY_PERSONAL_CODE_IS_INVALID, () => {
    it("should respond with status 200", async () => {
        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_PERSONAL_CODE_IS_INVALID);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.status).toBe(200);
        expect(res.text).toContain("[PLACEHOLDER]");
    });

    it("should show the error page if an error occurs", async () => {
        const errorMessage = "Test error";
        jest.spyOn(localise, "getLocalesService").mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_PERSONAL_CODE_IS_INVALID);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});
