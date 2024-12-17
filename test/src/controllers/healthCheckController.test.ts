import mocks from "../../mocks/all_middleware_mock";
import app from "../../../src/app";
import supertest from "supertest";
import { HEALTHCHECK, BASE_URL } from "../../../src/types/pageURL";
const router = supertest(app);

describe("GET" + HEALTHCHECK, () => {
    it("should return status 200", async () => {
        const res = await router.get(BASE_URL + HEALTHCHECK);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalledTimes(0);
        expect(res.text).toBe("{\"status\":\"OK\"}");
        expect(res.status).toBe(200);
    });
});
