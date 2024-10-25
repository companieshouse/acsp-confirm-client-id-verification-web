import { Request } from "express";
import { createRequest, MockRequest } from "node-mocks-http";
import { getSessionRequestWithPermission } from "../../mocks/session.mock";
import { AddressManualService } from "../../../src/services/addressManualService";
import { Session } from "@companieshouse/node-session-handler";
import { USER_DATA } from "../../../src/utils/constants";

describe("AddressManualService tests", () => {
    let req: MockRequest<Request>;
    let service: AddressManualService;

    beforeEach(() => {
        service = new AddressManualService();
        req = createRequest({});
        const session = getSessionRequestWithPermission();
        req.session = session;
    });

    it("should save the address to session", () => {
        const clientData = {};
        const mockManualAddressBody = {
            addressPropertyDetails: "Property Details",
            addressLine1: "Line 1",
            addressLine2: "Line 2",
            addressTown: "Town",
            addressCounty: "County",
            addressCountry: "Country",
            addressPostcode: "Postcode"
        };
        const session: Session = req.session as any as Session;
        req.body = mockManualAddressBody;
        service.saveManualAddress(req, clientData);

        expect(session.getExtraData(USER_DATA)).toEqual({
            address: {
                country: "Country",
                county: "County",
                line1: "Line 1",
                line2: "Line 2",
                postcode: "Postcode",
                propertyDetails: "Property Details",
                town: "Town"
            }
        });
    });

    it("should return address from clientData", () => {
        const clientData = {
            address: {
                country: "Country",
                county: "County",
                line1: "Line 1",
                line2: "Line 2",
                postcode: "Postcode",
                propertyDetails: "Property Details",
                town: "Town"
            }
        };

        const address = service.getManualAddress(clientData);
        expect(address).toEqual({
            addressCountry: "Country",
            addressCounty: "County",
            addressLine1: "Line 1",
            addressLine2: "Line 2",
            addressPostcode: "Postcode",
            addressTown: "Town",
            addressPropertyDetails: "Property Details"
        });
    });
});
