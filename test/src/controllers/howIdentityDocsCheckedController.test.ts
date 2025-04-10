import mocks from "../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../src/app";
import { HOW_IDENTITY_DOCUMENTS_CHECKED, BASE_URL, WHICH_IDENTITY_DOCS_CHECKED_GROUP1, WHICH_IDENTITY_DOCS_CHECKED_GROUP2 } from "../../../src/types/pageURL";
import * as localise from "../../../src/utils/localise";

jest.mock("@companieshouse/api-sdk-node");
const router = supertest(app);

describe("GET" + HOW_IDENTITY_DOCUMENTS_CHECKED, () => {

    it("should return status 200", async () => {
        const res = await router.get(BASE_URL + HOW_IDENTITY_DOCUMENTS_CHECKED);
        expect(res.status).toBe(200);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    });

    it("should show the error page if an error occurs", async () => {
        const errorMessage = "Test error";
        jest.spyOn(localise, "selectLang").mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.get(BASE_URL + HOW_IDENTITY_DOCUMENTS_CHECKED);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});

describe("POST" + HOW_IDENTITY_DOCUMENTS_CHECKED, () => {
    it("should return status 302 after redirect", async () => {
        const res = await router.post(BASE_URL + HOW_IDENTITY_DOCUMENTS_CHECKED).send({ howIdentityDocsCheckedRadio: "cryptographic_security_features_checked" });
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(BASE_URL + WHICH_IDENTITY_DOCS_CHECKED_GROUP1 + "?lang=en");
    });

    it("should return status 302 after redirect", async () => {
        const res = await router.post(BASE_URL + HOW_IDENTITY_DOCUMENTS_CHECKED).send({ howIdentityDocsCheckedRadio: "physical_security_features_checked" });
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(BASE_URL + WHICH_IDENTITY_DOCS_CHECKED_GROUP2 + "?lang=en");
    });

    it("should return status 400 after incorrect data entered", async () => {
        const res = await router.post(BASE_URL + HOW_IDENTITY_DOCUMENTS_CHECKED).send({ howIdentityDocsCheckedRadio: "" });
        expect(res.status).toBe(400);
        expect(res.text).toContain("Select if you used option 1 or option 2 to verify their identity");
    });

    it("should show the error page if an error occurs", async () => {
        const errorMessage = "Test error";
        jest.spyOn(localise, "selectLang").mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.post(BASE_URL + HOW_IDENTITY_DOCUMENTS_CHECKED);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});
