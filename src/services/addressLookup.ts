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
import { Session } from "@companieshouse/node-session-handler";
import { Address } from "../../model/Address";
import { ADDRESS_LIST } from "utils/constants";

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
                // save address list to session
                this.saveAddressListToSession(req, ukAddresses);
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

    public saveAddressListToSession (req: Request, ukAddresses: UKAddress[]): void {

        const addressList : Array<Address> = [];
        for (const ukAddress of ukAddresses) {
            const address = {
                propertyDetails: ukAddress.premise,
                line1: ukAddress.addressLine1,
                line2: ukAddress.addressLine2,
                town: ukAddress.postTown,
                country: getCountryFromKey(ukAddress.country),
                postcode: ukAddress.postcode,
                formattedAddress: ukAddress.premise + ", " + ukAddress.addressLine1 + ", " + ukAddress.postTown + ", " + getCountryFromKey(ukAddress.country) + ", " + ukAddress.postcode
            };

            addressList.push(address);

        }
        // Save the list of addresses to the session
        saveDataInSession(req, ADDRESS_LIST, addressList);
    }
}
