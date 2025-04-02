export const USER_DATA = "user";
export const ADDRESS_LIST = "addressList";
export const PREVIOUS_PAGE_URL: string = "previouspageurl";
export const REFERENCE = "reference";
export const CHECK_YOUR_ANSWERS_FLAG = "checkYourAnswersFlag";
export const ACSP_DETAILS = "acspDetails";
export const BIOMETRIC_PASSPORT = "biometric_passport";
export const PASSPORT = "passport";
export const ACTIVE_STATUS = "active";
export const VERIFY_SERVICE_LINK = "verify-service-link";
export const SERVICE_URL_LINK = "service-url-link";
export const AUTHORISED_AGENT_ACCOUNT_LINK = "authorised-agent-account-link";

// ID Document Details for the extended expiry date exception
const BRP_GRACED_EXPIRY_IN_MONTHS = 18;
const BIOMETRIC_PASSPORT_GRACED_EXPIRY_IN_MONTHS = 6;
const IRISH_PASSPORT_CARD_GRACED_EXPIRY_IN_MONTHS = 6;
export const ID_DOCUMENTS_WITH_GRACED_EXPIRY = {
    UK_biometric_residence_permit: BRP_GRACED_EXPIRY_IN_MONTHS,
    biometric_passport: BIOMETRIC_PASSPORT_GRACED_EXPIRY_IN_MONTHS,
    irish_passport_card: IRISH_PASSPORT_CARD_GRACED_EXPIRY_IN_MONTHS
};

// Matomo
export const MATOMO_LINK_CLICK = "Click link";
