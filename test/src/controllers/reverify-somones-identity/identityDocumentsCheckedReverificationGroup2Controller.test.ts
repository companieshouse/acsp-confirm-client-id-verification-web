import mocks from "../../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../../src/app";
import { REVERIFY_BASE_URL, REVERIFY_IDENTITY_DOCUMENTS_CHECKED_GROUP2 } from "../../../../src/types/pageURL";
import * as urlService from "../../../../src/services/url";
import * as localise from "../../../../src/utils/localise";

const router = supertest(app);

describe("GET", () => {
    it("Should display the option 2 eligible list of documents", async () => {
        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_IDENTITY_DOCUMENTS_CHECKED_GROUP2);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(res.status).toBe(200);
        expect(res.text).toContain("Select at least 2 documents. At least 1 of the documents must be from group A");
    });

    it("Should reditect accordiingly when back button is clicked", async () => {
        jest.spyOn(urlService, "getPreviousPageUrl").mockReturnValue(REVERIFY_BASE_URL + "/how-were-the-identity-documents-checked?lang=en");
        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_IDENTITY_DOCUMENTS_CHECKED_GROUP2);
        expect(res.text).toContain(REVERIFY_BASE_URL + "/how-were-the-identity-documents-checked?lang=en");
    });

    it("Should handle the exceptions with an appropiate error page.", async () => {
        const errorMessage = "Test error";
        jest.spyOn(localise, "getLocalesService").mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_IDENTITY_DOCUMENTS_CHECKED_GROUP2);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});
describe("POST", () => {
    it("Redirect to the ", () => {});
    it("Should advise the validation error when no documents are selected", () => {

    });
    it("", () => {});
    it("", () => {});
});
