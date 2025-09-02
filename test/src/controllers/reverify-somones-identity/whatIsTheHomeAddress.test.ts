import mocks from "../../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../../src/app";
import {
    REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS,
    REVERIFY_BASE_URL,
    REVERIFY_CHOOSE_AN_ADDRESS,
    REVERIFY_CONFIRM_HOME_ADDRESS,
    REVERIFY_CHECK_YOUR_ANSWERS,
    REVERIFY_DATE_OF_BIRTH
} from "../../../../src/types/pageURL";
import { getAddressFromPostcode } from "../../../../src/services/postcode-lookup-service";
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup/types";
import * as localise from "../../../../src/utils/localise";
import * as urlService from "../../../../src/services/url";

jest.mock("../../../../src/services/postcode-lookup-service.ts");

const router = supertest(app);
const mockResponseBodyOfUKAddress: UKAddress[] = [{
    premise: "2",
    addressLine1: "DUNCALF STREET",
    postTown: "STOKE-ON-TRENT",
    postcode: "ST6 3LJ",
    country: "GB-ENG"
}];

describe("GET" + REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS, () => {
    const addLangToUrl = localise.addLangToUrl;
    const lang = "en";
    const checkYourAnswersUrl = addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang);
    const dateOfBirthUrl = addLangToUrl(REVERIFY_BASE_URL + REVERIFY_DATE_OF_BIRTH, lang);

    afterEach(() => {
        jest.restoreAllMocks();
    });
    it("should return status 200", async () => {
        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS);
        expect(res.status).toBe(200);
        expect(res.text).toContain("John");
        expect(res.text).toContain("Doe");
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
    });

    it("should show the error page if an error occurs", async () => {
        const errorMessage = "Test error";
        jest.spyOn(localise, "getLocalesService").mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });

    it("should use previousPage as check your answers when previousPageUrl matches", async () => {
        jest.spyOn(urlService, "getPreviousPageUrl").mockReturnValue(checkYourAnswersUrl);

        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS);
        expect(res.status).toBe(200);
        expect(res.text).toContain(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS + "?lang=en");
    });

    it("should use previousPage as date of birth when previousPageUrl does not match check your answers", async () => {
        jest.spyOn(urlService, "getPreviousPageUrl").mockReturnValue(dateOfBirthUrl);

        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS);
        expect(res.status).toBe(200);
        expect(res.text).toContain(REVERIFY_BASE_URL + REVERIFY_DATE_OF_BIRTH + "?lang=en");
    });
});

describe("POST" + REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS, () => {
    const addLangToUrl = localise.addLangToUrl;
    const lang = "en";
    const checkYourAnswersUrl = addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang);
    const dateOfBirthUrl = addLangToUrl(REVERIFY_BASE_URL + REVERIFY_DATE_OF_BIRTH, lang);

    afterEach(() => {
        jest.restoreAllMocks();
    });
    it("should redirect to address list with status 302 on successful form submission", async () => {
        const formData = {
            postCode: "ST63LJ",
            premise: ""
        };

        (getAddressFromPostcode as jest.Mock).mockResolvedValueOnce(mockResponseBodyOfUKAddress);

        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS).send(formData);
        expect(res.status).toBe(302); // Expect a redirect status code
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(res.header.location).toBe(REVERIFY_BASE_URL + REVERIFY_CHOOSE_AN_ADDRESS + "?lang=en");
    });

    it("should redirect to confirm page status 302 on successful form submission", async () => {
        const formData = {
            postCode: "ST63LJ",
            premise: "2"
        };

        (getAddressFromPostcode as jest.Mock).mockResolvedValueOnce(mockResponseBodyOfUKAddress);

        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS).send(formData);
        expect(res.status).toBe(302); // Expect a redirect status code
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(res.header.location).toBe(REVERIFY_BASE_URL + REVERIFY_CONFIRM_HOME_ADDRESS + "?lang=en");
    });

    it("should return status 400 for invalid postcode entered", async () => {
        const formData = {
            postCode: "S6",
            premise: "2"
        };

        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS).send(formData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("John");
        expect(res.text).toContain("Doe");
        expect(res.text).toContain("Enter a full UK postcode");
    });

    it("should return status 400 for no postcode entered", async () => {
        const formData = {
            postCode: "",
            premise: "6"
        };

        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS).send(formData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("John");
        expect(res.text).toContain("Doe");
        expect(res.text).toContain("Enter a postcode");
    });

    it("should return status 400 for no data entered", async () => {
        const formData = {
            postCode: "",
            premise: ""
        };

        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS).send(formData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("John");
        expect(res.text).toContain("Doe");
        expect(res.text).toContain("Enter a postcode");
    });

    it("should return status 400 for no postcode found", async () => {
        const formData = {
            postCode: "AB12CD",
            premise: ""
        };
        (getAddressFromPostcode as jest.Mock).mockRejectedValueOnce(new Error("Postcode not found"));

        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS).send(formData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("John");
        expect(res.text).toContain("Doe");
        expect(res.text).toContain("We cannot find this postcode. Enter a different one, or enter the address manually");
    });
    it("should use previousPage as check your answers when previousPageUrl matches", async () => {
        jest.spyOn(urlService, "getPreviousPageUrl").mockReturnValue(checkYourAnswersUrl);

        const formData = {
            postCode: "ST63LJ",
            premise: ""
        };

        (getAddressFromPostcode as jest.Mock).mockResolvedValueOnce([{
            premise: "2",
            addressLine1: "DUNCALF STREET",
            postTown: "STOKE-ON-TRENT",
            postcode: "ST6 3LJ",
            country: "GB-ENG"
        }]);

        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS).send(formData);
        expect(res.status).toBe(302);
        (getAddressFromPostcode as jest.Mock).mockRejectedValueOnce(new Error("Postcode not found"));
        const res2 = await router.post(REVERIFY_BASE_URL + REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS).send({ postCode: "AB12CD", premise: "" });
        expect(res2.status).toBe(400);
        expect(res2.text).toContain(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS + "?lang=en");
    });

    it("should use previousPage as date of birth when previousPageUrl does not match check your answers", async () => {
        jest.spyOn(urlService, "getPreviousPageUrl").mockReturnValue(dateOfBirthUrl);

        const formData = {
            postCode: "ST63LJ",
            premise: ""
        };
        (getAddressFromPostcode as jest.Mock).mockResolvedValueOnce([{
            premise: "2",
            addressLine1: "DUNCALF STREET",
            postTown: "STOKE-ON-TRENT",
            postcode: "ST6 3LJ",
            country: "GB-ENG"
        }]);

        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS).send(formData);
        expect(res.status).toBe(302);
        (getAddressFromPostcode as jest.Mock).mockRejectedValueOnce(new Error("Postcode not found"));
        const res2 = await router.post(REVERIFY_BASE_URL + REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS).send({ postCode: "AB12CD", premise: "" });
        expect(res2.status).toBe(400);
        expect(res2.text).toContain(REVERIFY_BASE_URL + REVERIFY_DATE_OF_BIRTH + "?lang=en");
    });
    it("should show the error page if an error occurs", async () => {
        const errorMessage = "Test error";
        jest.spyOn(localise, "getLocalesService").mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});
