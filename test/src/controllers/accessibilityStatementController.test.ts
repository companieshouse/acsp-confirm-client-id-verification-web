import mocks from "../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../src/app";
import { BASE_URL, ACCESSIBILITY_STATEMENT } from "../../../src/types/pageURL";
import * as localise from "../../../src/utils/localise";

const router = supertest(app);

describe("GET" + ACCESSIBILITY_STATEMENT, () => {
    it("should return status 200 and render the accessibility statement page", async () => {
        const response = await router.get(BASE_URL + ACCESSIBILITY_STATEMENT);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalledTimes(0);
        expect(response.status).toBe(200);
        expect(response.text).toContain("Accessibility statement for the Tell Companies House you have verified someone's identity service");
    });

    it("should return status 500 if an error occurs", async () => {
        jest.spyOn(localise, "getLocalesService").mockImplementationOnce(() => {
            throw new Error("Test error");
        });
        const res = await router.get(BASE_URL + ACCESSIBILITY_STATEMENT);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});
