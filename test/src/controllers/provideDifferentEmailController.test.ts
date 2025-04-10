import mocks from "../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../src/app";
import { BASE_URL, PROVIDE_DIFFERENT_EMAIL } from "../../../src/types/pageURL";
import * as localise from "../../../src/utils/localise";

const router = supertest(app);

describe("GET " + PROVIDE_DIFFERENT_EMAIL, () => {
    it("should respond with status 200", async () => {
        const res = await router.get(BASE_URL + PROVIDE_DIFFERENT_EMAIL)
            .send({
                "first-name": "John",
                "last-name": "Doe",
                "email-address": "johndoe@gmail.com"
            });
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.status).toBe(200);
        expect(res.text).toContain("You need to provide a different email address");
    });

    it("should show the error page if an error occurs", async () => {
        const errorMessage = "Test error";
        jest.spyOn(localise, "getLocalesService").mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.get(BASE_URL + PROVIDE_DIFFERENT_EMAIL);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});
