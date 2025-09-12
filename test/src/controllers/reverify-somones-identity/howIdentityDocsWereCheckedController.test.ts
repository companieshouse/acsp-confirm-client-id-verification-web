import mocks from "../../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../../src/app";
import { REVERIFY_HOW_IDENTITY_DOCUMENTS_CHECKED, REVERIFY_BASE_URL, REVERIFY_WHICH_IDENTITY_DOCS_CHECKED_GROUP2, REVERIFY_WHICH_IDENTITY_DOCS_CHECKED_GROUP1, REVERIFY_CHECK_YOUR_ANSWERS } from "../../../../src/types/pageURL";
import * as localise from "../../../../src/utils/localise";
import { CRYPTOGRAPHIC_SECURITY_FEATURES, PHYSICAL_SECURITY_FEATURES } from "../../../../src/utils/constants";

jest.mock("@companieshouse/api-sdk-node");
const router = supertest(app);

describe("GET" + REVERIFY_HOW_IDENTITY_DOCUMENTS_CHECKED, () => {

    it("should return status 200", async () => {
        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_HOW_IDENTITY_DOCUMENTS_CHECKED);
        expect(res.status).toBe(200);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    });

    it("should show the error page if an error occurs", async () => {
        const errorMessage = "Test error";
        jest.spyOn(localise, "getLocalesService").mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_HOW_IDENTITY_DOCUMENTS_CHECKED);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });

    it("should return status 200 when accessing page directly from check your answers URL", async () => {
        const res = await router
            .get(REVERIFY_BASE_URL + REVERIFY_HOW_IDENTITY_DOCUMENTS_CHECKED)
            .set("Referer", REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS + "?lang=en");
        expect(res.status).toBe(200);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    });
});

describe("POST" + REVERIFY_HOW_IDENTITY_DOCUMENTS_CHECKED, () => {
    it("should return status 302 after redirect", async () => {
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_HOW_IDENTITY_DOCUMENTS_CHECKED).send({ howIdentityDocsCheckedRadio: CRYPTOGRAPHIC_SECURITY_FEATURES });
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(REVERIFY_BASE_URL + REVERIFY_WHICH_IDENTITY_DOCS_CHECKED_GROUP1 + "?lang=en");
    });

    it("should return status 302 after redirect", async () => {
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_HOW_IDENTITY_DOCUMENTS_CHECKED).send({ howIdentityDocsCheckedRadio: PHYSICAL_SECURITY_FEATURES });
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(REVERIFY_BASE_URL + REVERIFY_WHICH_IDENTITY_DOCS_CHECKED_GROUP2 + "?lang=en");
    });

    it("should return status 400 after incorrect data entered", async () => {
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_HOW_IDENTITY_DOCUMENTS_CHECKED).send({ howIdentityDocsCheckedRadio: "" });
        expect(res.status).toBe(400);
        expect(res.text).toContain("Select if the identity documents were checked using technology or by a person");
    });

    it("should show the error page if an error occurs", async () => {
        const errorMessage = "Test error";
        jest.spyOn(localise, "getLocalesService").mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_HOW_IDENTITY_DOCUMENTS_CHECKED);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});
