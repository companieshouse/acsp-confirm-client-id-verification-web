import { Address } from "./Address";
import { Nationality } from "./Nationality";

export interface ClientData {
    id: string;
    firstName?: string;
    lastName?: string;
    addresses?: Array<Address>;
    address?: Address;
    dateOfBirth? : Date;
    nationality? : Array<Nationality>;
    countryOfResidence? : string;
}
