export const USER_DATA = "user";
export const ADDRESS_LIST = "addressList";
export const PREVIOUS_PAGE_URL: string = "previouspageurl";
export const REFERENCE = "reference";
export const CHECK_YOUR_ANSWERS_FLAG = "checkYourAnswersFlag";
export const ACSP_DETAILS = "acspDetails";
export const BIOMETRIC_PASSPORT = "biometric_passport";
export const PASSPORT = "passport";
export const ACTIVE_STATUS = "active";
export const CEASED = "ceased";
export const VERIFY_SERVICE_LINK = "verify-service-link";
export const SERVICE_URL_LINK = "service-url-link";
export const AUTHORISED_AGENT_ACCOUNT_LINK = "authorised-agent-account-link";
// Matomo
export const MATOMO_LINK_CLICK = "Click link";

// ID Document Details for the extended expiry date exceptions
const GRACED_EXPIRY_OF_SIX_MONTHS = 6;
const GRACED_EXPIRY_OF_EIGHTEEN_MONTHS = 18;

export const OPTION_1_ID_DOCUMENTS_WITH_GRACED_EXPIRY = {
    UK_biometric_residence_permit: GRACED_EXPIRY_OF_EIGHTEEN_MONTHS,
    biometric_passport: GRACED_EXPIRY_OF_SIX_MONTHS,
    irish_passport_card: GRACED_EXPIRY_OF_SIX_MONTHS
};

export const OPTION_2_ID_DOCUMENTS_WITH_GRACED_EXPIRY = {
    UK_biometric_residence_permit: GRACED_EXPIRY_OF_EIGHTEEN_MONTHS,
    irish_passport_card: GRACED_EXPIRY_OF_EIGHTEEN_MONTHS,
    passport: GRACED_EXPIRY_OF_EIGHTEEN_MONTHS
};
export const CRYPTOGRAPHIC_SECURITY_FEATURES = "cryptographic_security_features_checked";
export const PHYSICAL_SECURITY_FEATURES = "physical_security_features_checked";

export const DATA_SUBMITTED_AND_EMAIL_SENT = "dataSubmittedAndEmailSent";

// service names
export const VERIFY_SERVICE_NAME = "Tell Companies House you have verified someone's identity";
export const REVERIFY_SERVICE_NAME = "Reverify someone's identity for Companies House";
