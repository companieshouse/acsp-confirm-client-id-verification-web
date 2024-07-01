import { Request } from "express";
import { getAddressFromPostcode } from "./postcode-lookup-service";
import { addLangToUrl, selectLang } from "../utils/localise";
import { BASE_URL } from "../types/pageURL";
import { ClientData } from "model/ClientData";
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup/types";
import { getCountryFromKey } from "../utils/web";
import { Session } from "@companieshouse/node-session-handler";
import { USER_DATA } from "../utils/constants";
import { saveDataInSession } from "../utils/sessionHelper";

export class AddressLookUpService {
    public getAddressFromPostcode (req: Request, postcode: string, inputPremise: string, clientData: ClientData, ...nexPageUrls: string[]) : Promise<string> {
        const lang = selectLang(req.query.lang);
        return getAddressFromPostcode(postcode).then((ukAddresses) => {
            if (inputPremise !== "" && ukAddresses.find((address) => address.premise === inputPremise)) {
                // save address data to session
                clientData.address = this.getAddress(ukAddresses, inputPremise);
                saveDataInSession(req, USER_DATA, clientData);
                return addLangToUrl(BASE_URL + nexPageUrls[0], lang);
            } else {
                // TODO: save address list to session
                return addLangToUrl(BASE_URL + nexPageUrls[1], lang);
            }
        }).catch((err) => {
            throw err;
        });
    }

    private getAddress (ukAddresses: UKAddress[], inputPremise: string) {
        const address = ukAddresses.find((address) => address.premise === inputPremise);
        return {
            propertyDetails: address?.premise,
            line1: address?.addressLine1,
            line2: address?.addressLine2,
            town: address?.postTown,
            country: getCountryFromKey(address?.country!),
            postcode: address?.postcode
        };
    }
}
