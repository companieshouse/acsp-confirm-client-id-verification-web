import { Address } from "./Address";

export interface ClientData {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    dateOfBirth?: Date;
    address?: Address;
    emailAddress?: String;
    confirmEmailAddress?: String
}
