import mocks from "../../mocks/all_middleware_mock";
import supertest from "supertest";
import app from "../../../src/app";
import { BASE_URL, HOME_ADDRESS, CHOOSE_AN_ADDRESS, CONFIRM_HOME_ADDRESS } from "../../../src/types/pageURL";
import { getAddressFromPostcode } from "../../../src/services/postcode-lookup-service";
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup/types";
import { Address } from "../../../src/model/Address";


jest.mock("../../../src/services/postcode-lookup-service.ts");

const router = supertest(app);
const address: Address = {
    propertyDetails: "2",
    line1: "DUNCALF STREET",
    postcode: "ST6 3LJ"
};

const mockResponseBodyOfUKAddress: UKAddress[] = [{
    premise: "2",
    addressLine1: "DUNCALF STREET",
    postTown: "STOKE-ON-TRENT",
    postcode: "ST6 3LJ",
    country: "GB-ENG"
}];

describe("GET" + HOME_ADDRESS, () => {
    it("should return status 200", async () => {
        const res = await router.get(BASE_URL + HOME_ADDRESS);
        expect(res.status).toBe(200);
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
    });
});

describe("POST" + HOME_ADDRESS, () => {

    it("should redirect to address list with status 302 on successful form submission", async () => {
        const formData = {
            postCode: "ST63LJ",
            premise: ""
        };

        (getAddressFromPostcode as jest.Mock).mockResolvedValueOnce(mockResponseBodyOfUKAddress);

        const res = await router.post(BASE_URL + HOME_ADDRESS).send(formData);
        expect(res.status).toBe(302); // Expect a redirect status code
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(res.header.location).toBe(BASE_URL + CHOOSE_AN_ADDRESS + "?lang=en");
    });

    it("should redirect to confirm page status 302 on successful form submission", async () => {
        const formData = {
            postCode: "ST63LJ",
            premise: "2"
        };

        (getAddressFromPostcode as jest.Mock).mockResolvedValueOnce(mockResponseBodyOfUKAddress);

        const res = await router.post(BASE_URL + HOME_ADDRESS).send(formData);
        expect(res.status).toBe(302); // Expect a redirect status code
        expect(mocks.mockSessionMiddleware).toHaveBeenCalled();
        expect(res.header.location).toBe(BASE_URL + CONFIRM_HOME_ADDRESS + "?lang=en");
    });

    it("should return status 400 for invalid postcode entered", async () => {
        const formData = {
            postCode: "S6",
            premise: "2"
        };

        const res = await router.post(BASE_URL + HOME_ADDRESS).send(formData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("Enter a full UK postcode");
    });

    it("should return status 400 for no postcode entered", async () => {
        const formData = {
            postCode: "",
            premise: "6"
        };

        const res = await router.post(BASE_URL + HOME_ADDRESS).send(formData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("Enter a postcode");
    });

    it("should return status 400 for no data entered", async () => {
        const formData = {
            postCode: "",
            premise: ""
        };

        const res = await router.post(BASE_URL + HOME_ADDRESS).send(formData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("Enter a postcode");
    });

    it("should return status 400 for no postcode found", async () => {
        const formData = {
            postCode: "AB12CD",
            premise: ""
        };
        (getAddressFromPostcode as jest.Mock).mockRejectedValueOnce(new Error("Postcode not found"));

        const res = await router.post(BASE_URL + HOME_ADDRESS).send(formData);
        expect(res.status).toBe(400);
        expect(res.text).toContain("We cannot find this postcode. Enter a different one, or enter the address manually");
    });
});
