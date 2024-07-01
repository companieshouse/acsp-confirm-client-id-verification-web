import supertest from "supertest";
import app from "../../../src/app";
import { BASE_URL, CHOOSE_AN_ADDRESS } from "../../../src/types/pageURL";

jest.mock("@companieshouse/api-sdk-node");
const router = supertest(app);

describe("POST" + CHOOSE_AN_ADDRESS, () => {

    describe("POST" + CHOOSE_AN_ADDRESS, () => {
        it("should return status 400 after no radio btn selected", async () => {
            router.post(BASE_URL + CHOOSE_AN_ADDRESS).send({ homeAddress: "" });
            expect(400);
        });
    });

});
