import { Address } from "./Address";
import { DocumentDetails } from "./DocumentDetails";

export interface ClientData {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    useNameOnPublicRegister?: string;
    dateOfBirth?: Date | string;
    address?: Address;
    documentsChecked?: string[];
    idDocumentDetails?: DocumentDetails[];
    emailAddress?: string;
    confirmEmailAddress?: string;
    howIdentityDocsChecked?: string;
    whenIdentityChecksCompleted?: Date | string;
    confirmIdentityVerified?: string;
    preferredFirstName?: string;
    preferredMiddleName?: string;
    preferredLastName?: string;
}
