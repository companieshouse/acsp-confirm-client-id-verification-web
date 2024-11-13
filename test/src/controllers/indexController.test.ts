import mocks from "../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../src/app";
import { BASE_URL, HOME_URL } from "../../../src/types/pageURL";
const router = supertest(app);

describe("Home Page tests -", () => {
    describe("GET " + HOME_URL, () => {
        it("should return status 200", async () => {
            const res = await router.get(BASE_URL + HOME_URL);
            await router.get(BASE_URL);
            expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
            expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
            expect(mocks.mockAcspAuthenticationMiddleware).toHaveBeenCalled();
            expect(200);
            expect(res.text).toContain("Tell Companies House you have verified someone’s identity");
        });
    });

});
