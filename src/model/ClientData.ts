import { Address } from "./Address";

export interface ClientData {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    dateOfBirth?: Date;
    address?: Address;
    documentsChecked?: string[];
    emailAddress?: string;
    confirmEmailAddress?: string;
    howIdentityDocsChecked?: string;
    whenIdentityChecksCompleted?: Date;
    confirmIdentityVerified?: string;
}
