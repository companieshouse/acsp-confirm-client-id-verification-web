import { Request } from "express";
import { Address } from "../model/Address";
import { ClientData } from "../model/ClientData";
import { USER_DATA } from "../utils/constants";
import { saveDataInSession } from "../utils/sessionHelper";

export class AddressManualService {
    public saveManualAddress (req: Request, clientData: ClientData): void {
        // Extract address details from request body
        const homeAddress: Address = {
            propertyDetails: req.body.addressPropertyDetails,
            line1: req.body.addressLine1,
            line2: req.body.addressLine2,
            town: req.body.addressTown,
            county: req.body.addressCounty,
            country: req.body.addressCountry,
            postcode: req.body.addressPostcode
        };

        clientData.address = homeAddress;
        saveDataInSession(req, USER_DATA, clientData);
    }

    public getManualAddress (clientData: ClientData) {
        return {
            propertyDetails: clientData.address?.propertyDetails,
            addressLine1: clientData.address?.line1,
            addressLine2: clientData.address?.line2,
            addressTown: clientData.address?.town,
            addressCounty: clientData.address?.county,
            addressCountry: clientData.address?.country,
            addressPostcode: clientData.address?.postcode
        };
    }
}
