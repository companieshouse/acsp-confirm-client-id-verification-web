import mocks from "../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../src/app";
import { BASE_URL, ACCESSIBILITY_STATEMENT } from "../../../src/types/pageURL";

const router = supertest(app);

describe("GET" + ACCESSIBILITY_STATEMENT, () => {
    it("should return status 200 and render the accessibility statement page", async () => {
        const response = await router.get(BASE_URL + ACCESSIBILITY_STATEMENT);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalledTimes(0);
        expect(response.status).toBe(200);
        expect(response.text).toContain("Accessibility statement for the Companies House service");
    });
});
