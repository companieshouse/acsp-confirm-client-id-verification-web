import mocks from "../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../src/app";
import { BASE_URL, CANNOT_USE_SERVICE_WHILE_SUSPENDED } from "../../../src/types/pageURL";
import * as localise from "../../../src/utils/localise";

const router = supertest(app);

describe("GET" + CANNOT_USE_SERVICE_WHILE_SUSPENDED, () => {
    it("should render the confirmation page with status 200 ans display the information on the screen", async () => {
        const res = await router.get(BASE_URL + CANNOT_USE_SERVICE_WHILE_SUSPENDED);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(res.status).toBe(200);
        expect(res.text).toContain("You cannot use this service while the authorised agent is suspended");
    });

    it("should return status 500 if an error occurs", async () => {
        jest.spyOn(localise, "getLocalesService").mockImplementationOnce(() => {
            throw new Error("Test error");
        });
        const res = await router.get(BASE_URL + CANNOT_USE_SERVICE_WHILE_SUSPENDED);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});
