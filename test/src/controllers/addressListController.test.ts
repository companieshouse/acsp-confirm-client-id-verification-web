import mocks from "../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../src/app";
import { BASE_URL, CONFIRM_HOME_ADDRESS, CHOOSE_AN_ADDRESS } from "../../../src/types/pageURL";
import * as localise from "../../../src/utils/localise";

jest.mock("@companieshouse/api-sdk-node");

const router = supertest(app);

describe("GET" + CHOOSE_AN_ADDRESS, () => {
    it("should return status 200", async () => {
        const res = await router.get(BASE_URL + CHOOSE_AN_ADDRESS);
        expect(res.status).toBe(200);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.text).toContain("Choose an address");
    });

    it("should return status 500 if an error occurs", async () => {
        jest.spyOn(localise, "getLocalesService").mockImplementationOnce(() => {
            throw new Error("Test error");
        });
        const res = await router.get(BASE_URL + CHOOSE_AN_ADDRESS);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});

describe("POST" + CHOOSE_AN_ADDRESS, () => {

    // Test for correct form details entered, will return 302.
    it("should return status 302 and redirect to home address confirm screen", async () => {

        const res = await router.post(BASE_URL + CHOOSE_AN_ADDRESS).send({ homeAddress: "1" });
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(BASE_URL + CONFIRM_HOME_ADDRESS + "?lang=en");
    });

    // Test for incorrect form details entered, will return 400.
    it("should return status 400 after incorrect data entered", async () => {
        const res = await router.post(BASE_URL + CHOOSE_AN_ADDRESS).send({ homeAddress: "" });
        expect(res.status).toBe(400);
        expect(res.text).toContain("Select the home address");
    });

    it("should return status 500 if an error occurs", async () => {
        jest.spyOn(localise, "getLocalesService").mockImplementationOnce(() => {
            throw new Error("Test error");
        });
        const res = await router.post(BASE_URL + CHOOSE_AN_ADDRESS);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});
