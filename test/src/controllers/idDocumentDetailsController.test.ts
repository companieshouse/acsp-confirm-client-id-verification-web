import mocks from "../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../src/app";
import { BASE_URL, CONFIRM_IDENTITY_VERIFICATION, ID_DOCUMENT_DETAILS } from "../../../src/types/pageURL";
import { ClientData } from "../../../src/model/ClientData";

jest.mock("@companieshouse/api-sdk-node");

const router = supertest(app);

describe("GET" + ID_DOCUMENT_DETAILS, () => {
    it("should return status 200", async () => {
        const res = await router.get(BASE_URL + ID_DOCUMENT_DETAILS);
        expect(res.status).toBe(200);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.text).toContain("Enter the details exactly as they appear on the document");
    });
});

describe("POST " + ID_DOCUMENT_DETAILS, () => {
    const FormData = {
        documentNumber_1: "ABC12345X",
        expiryDateDay_1: "01",
        expiryDateMonth_1: "12",
        expiryDateYear_1: "2030",
        countryInput_1: "United Kingdom"
    };

    it("should redirect to confirmation page on valid input", async () => {
        const res = await router.post(BASE_URL + ID_DOCUMENT_DETAILS).send(FormData);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(BASE_URL + CONFIRM_IDENTITY_VERIFICATION + "?lang=en");
    });

});

describe("POST " + ID_DOCUMENT_DETAILS, () => {
    const FormData = {
        documentNumber_1: "",
        expiryDateDay_1: "",
        expiryDateMonth_1: "",
        expiryDateYear_1: "",
        countryInput_1: ""
    };

    it("should status 400 for invalid input", async () => {
        const res = await router.post(BASE_URL + ID_DOCUMENT_DETAILS).send(FormData);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.status).toBe(400);
    });
});
