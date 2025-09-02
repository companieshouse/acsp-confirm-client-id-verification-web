import mocks from "../../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../../src/app";
import {
    REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS,
    REVERIFY_BASE_URL,
    REVERIFY_CHOOSE_AN_ADDRESS,
    REVERIFY_CONFIRM_HOME_ADDRESS,
    REVERIFY_CHECK_YOUR_ANSWERS,
    REVERIFY_DATE_OF_BIRTH,
    REVERIFY_HOME_ADDRESS_MANUAL
} from "../../../../src/types/pageURL";
import { getAddressFromPostcode } from "../../../../src/services/postcode-lookup-service";
import * as localise from "../../../../src/utils/localise";
import * as urlService from "../../../../src/services/url";

jest.mock("../../../../src/services/postcode-lookup-service.ts");

const router = supertest(app);
const mockResponseBodyOfUKAddress = [{
    premise: "2",
    addressLine1: "DUNCALF STREET",
    postTown: "STOKE-ON-TRENT",
    postcode: "ST6 3LJ",
    country: "GB-ENG"
}];

describe("GET " + REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS, () => {
    const addLangToUrl = localise.addLangToUrl;
    const lang = "en";
    const checkYourAnswersUrl = addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang);
    const dateOfBirthUrl = addLangToUrl(REVERIFY_BASE_URL + REVERIFY_DATE_OF_BIRTH, lang);

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should render page with previousPage as check your answers when previousPageUrl matches", async () => {
        jest.spyOn(urlService, "getPreviousPageUrl").mockReturnValue(checkYourAnswersUrl);

        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS);
        expect(res.status).toBe(200);
        expect(res.text).toContain(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS + "?lang=en");
        expect(res.text).toContain(REVERIFY_BASE_URL + REVERIFY_HOME_ADDRESS_MANUAL + "?lang=en");
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
    });

    it("should render page with previousPage as date of birth when previousPageUrl does not match", async () => {
        jest.spyOn(urlService, "getPreviousPageUrl").mockReturnValue(dateOfBirthUrl);

        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS);
        expect(res.status).toBe(200);
        expect(res.text).toContain(REVERIFY_BASE_URL + REVERIFY_DATE_OF_BIRTH + "?lang=en");
        expect(res.text).toContain(REVERIFY_BASE_URL + REVERIFY_HOME_ADDRESS_MANUAL + "?lang=en");
    });

    it("should show the error page if an error occurs", async () => {
        jest.spyOn(localise, "getLocalesService").mockImplementationOnce(() => {
            throw new Error("Test error");
        });
        const res = await router.get(REVERIFY_BASE_URL + REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});

describe("POST " + REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS, () => {
    const addLangToUrl = localise.addLangToUrl;
    const lang = "en";
    const checkYourAnswersUrl = addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang);
    const dateOfBirthUrl = addLangToUrl(REVERIFY_BASE_URL + REVERIFY_DATE_OF_BIRTH, lang);

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should redirect to address list with status 302 on successful form submission (no premise)", async () => {
        jest.spyOn(urlService, "getPreviousPageUrl").mockReturnValue(checkYourAnswersUrl);
        (getAddressFromPostcode as jest.Mock).mockResolvedValueOnce(mockResponseBodyOfUKAddress);

        const formData = { postCode: "ST63LJ", premise: "" };
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS).send(formData);
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(REVERIFY_BASE_URL + REVERIFY_CHOOSE_AN_ADDRESS + "?lang=en");
    });

    it("should redirect to confirm page with status 302 on successful form submission (with premise)", async () => {
        jest.spyOn(urlService, "getPreviousPageUrl").mockReturnValue(checkYourAnswersUrl);
        (getAddressFromPostcode as jest.Mock).mockResolvedValueOnce(mockResponseBodyOfUKAddress);

        const formData = { postCode: "ST63LJ", premise: "2" };
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS).send(formData);
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(REVERIFY_BASE_URL + REVERIFY_CONFIRM_HOME_ADDRESS + "?lang=en");
    });

    it("should return status 400 for invalid postcode entered", async () => {
        jest.spyOn(urlService, "getPreviousPageUrl").mockReturnValue(checkYourAnswersUrl);

        const formData = { postCode: "S6", premise: "2" };
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS).send(formData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("Enter a full UK postcode");
        expect(res.text).toContain(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS + "?lang=en");
    });

    it("should return status 400 for no postcode entered", async () => {
        jest.spyOn(urlService, "getPreviousPageUrl").mockReturnValue(dateOfBirthUrl);

        const formData = { postCode: "", premise: "6" };
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS).send(formData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("Enter a postcode");
        expect(res.text).toContain(REVERIFY_BASE_URL + REVERIFY_DATE_OF_BIRTH + "?lang=en");
    });

    it("should return status 400 for no data entered", async () => {
        jest.spyOn(urlService, "getPreviousPageUrl").mockReturnValue(dateOfBirthUrl);

        const formData = { postCode: "", premise: "" };
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS).send(formData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("Enter a postcode");
        expect(res.text).toContain(REVERIFY_BASE_URL + REVERIFY_DATE_OF_BIRTH + "?lang=en");
    });

    it("should return status 400 for no postcode found (address lookup error)", async () => {
        jest.spyOn(urlService, "getPreviousPageUrl").mockReturnValue(checkYourAnswersUrl);
        (getAddressFromPostcode as jest.Mock).mockRejectedValueOnce(new Error("Postcode not found"));

        const formData = { postCode: "AB12CD", premise: "" };
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS).send(formData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("We cannot find this postcode. Enter a different one, or enter the address manually");
        expect(res.text).toContain(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS + "?lang=en");
    });

    it("should use previousPage as check your answers when previousPageUrl matches (error case)", async () => {
        jest.spyOn(urlService, "getPreviousPageUrl").mockReturnValue(checkYourAnswersUrl);
        (getAddressFromPostcode as jest.Mock).mockRejectedValueOnce(new Error("Postcode not found"));

        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS).send({ postCode: "AB12CD", premise: "" });
        expect(res.status).toBe(400);
        expect(res.text).toContain(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS + "?lang=en");
    });

    it("should use previousPage as date of birth when previousPageUrl does not match check your answers (error case)", async () => {
        jest.spyOn(urlService, "getPreviousPageUrl").mockReturnValue(dateOfBirthUrl);
        (getAddressFromPostcode as jest.Mock).mockRejectedValueOnce(new Error("Postcode not found"));

        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS).send({ postCode: "AB12CD", premise: "" });
        expect(res.status).toBe(400);
        expect(res.text).toContain(REVERIFY_BASE_URL + REVERIFY_DATE_OF_BIRTH + "?lang=en");
    });

    it("should show the error page if an error occurs", async () => {
        jest.spyOn(localise, "getLocalesService").mockImplementationOnce(() => {
            throw new Error("Test error");
        });
        const res = await router.post(REVERIFY_BASE_URL + REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS);
        expect(res.status).toBe(500);
        expect(res.text).toContain("Sorry we are experiencing technical difficulties");
    });
});
