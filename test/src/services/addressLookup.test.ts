
import { Request } from "express";
import { createRequest, MockRequest } from "node-mocks-http";
import { getSessionRequestWithPermission } from "../../mocks/session.mock";
import { Session } from "@companieshouse/node-session-handler";
import { getCountryFromKey } from "../../../src/utils/web";
import { ClientData } from "../../../src/model/ClientData";
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";
import { getAddressFromPostcode } from "../../../src/services/postcode-lookup-service";
import { AddressLookUpService } from "../../../src/services/addressLookup";
import { USER_DATA } from "../../../src/utils/constants";

jest.mock("../../../src/services/postcode-lookup-service.ts");

const service = new AddressLookUpService();
const mockResponseBodyOfUKAddress: UKAddress[] = [{
    premise: "2",
    addressLine1: "DUNCALF STREET",
    postTown: "STOKE-ON-TRENT",
    postcode: "ST6 3LJ",
    country: "GB-ENG"
}];

describe("saveAddressToSession tests", () => {
    let req: MockRequest<Request>;
    beforeEach(() => {
        req = createRequest({
            method: "POST",
            url: "/"
        });
        const session = getSessionRequestWithPermission();
        req.session = session;
    });

    it("should save address to session", () => {
        const session: Session = req.session as any as Session;
        const nextPageUrls: string[] = ["string1", "string2"];
        const clientData: ClientData = {};
        session.setExtraData(USER_DATA, clientData);
        (getAddressFromPostcode as jest.Mock).mockResolvedValueOnce(mockResponseBodyOfUKAddress);
        service.getAddressFromPostcode(req, "ST6 3LJ", "2", clientData, ...nextPageUrls);
        clientData.address = {
            propertyDetails: "2",
            line1: "DUNCALF STREET",
            town: "STOKE-ON-TRENT",
            country: "GB-ENG",
            postcode: "ST6 3LJ"
        };

        expect(session.getExtraData(USER_DATA)).toEqual(clientData);
    });
});
