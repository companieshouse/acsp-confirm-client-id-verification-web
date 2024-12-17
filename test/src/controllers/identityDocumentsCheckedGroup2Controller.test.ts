import mocks from "../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../src/app";
import { BASE_URL, ID_DOCUMENT_DETAILS, WHICH_IDENTITY_DOCS_CHECKED_GROUP2 } from "../../../src/types/pageURL";
jest.mock("@companieshouse/api-sdk-node");

const router = supertest(app);

describe("GET" + WHICH_IDENTITY_DOCS_CHECKED_GROUP2, () => {
    it("should return status 200", async () => {
        const res = await router.get(BASE_URL + WHICH_IDENTITY_DOCS_CHECKED_GROUP2);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.status).toBe(200);
        expect(res.text).toContain("Which documents did you check to verify their identity?");
        expect(res.text).toContain("John");
        expect(res.text).toContain("Doe");
    });
});

describe("POST" + WHICH_IDENTITY_DOCS_CHECKED_GROUP2, () => {
    it("should return status 302 after redirecting to the next page", async () => {
        const inputData = {
            documentsGroup2A: ["ukFrontierPermit"],
            documentsGroup2B: ["marriageCert"]
        };
        const res = await router.post(BASE_URL + WHICH_IDENTITY_DOCS_CHECKED_GROUP2).send(inputData);
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(BASE_URL + ID_DOCUMENT_DETAILS + "?lang=en");
    });

    it("should return status 302 after redirecting to the next page", async () => {
        const inputData = {
            documentsGroup2A: "ukFrontierPermit",
            documentsGroup2B: "marriageCert"
        };
        const res = await router.post(BASE_URL + WHICH_IDENTITY_DOCS_CHECKED_GROUP2).send(inputData);
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(BASE_URL + ID_DOCUMENT_DETAILS + "?lang=en");
    });

    it("should return status 400 when no documents are selected", async () => {
        const inputData = {};
        const res = await router.post(BASE_URL + WHICH_IDENTITY_DOCS_CHECKED_GROUP2).send(inputData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("Select which documents you checked to verify their identity");
    });

    it("should return status 400 when no group A documents are selected", async () => {
        const inputData = {
            documentsGroup2B: "marriageCert"
        };
        const res = await router.post(BASE_URL + WHICH_IDENTITY_DOCS_CHECKED_GROUP2).send(inputData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("Select at least one document from group A");
    });

    it("should return status 400 when only 1 document is selected", async () => {
        const inputData = {
            documentsGroup2A: "ukFrontierPermit"
        };
        const res = await router.post(BASE_URL + WHICH_IDENTITY_DOCS_CHECKED_GROUP2).send(inputData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("Select at least 2 documents");
    });
});
