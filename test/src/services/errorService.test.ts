import mocks from "../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../src/app";
import { BASE_URL } from "../../../src/types/pageURL";

jest.mock("@companieshouse/api-sdk-node");

const router = supertest(app);

describe("GET url that does not exist", () => {
    it("should render the 404 page with status 404", async () => {
        const res = await router.get(BASE_URL + "unusedURL");
        expect(res.status).toBe(404);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(res.text).toContain("Page not found");
    });
});
