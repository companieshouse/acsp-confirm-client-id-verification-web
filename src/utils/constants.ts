export const USER_DATA = "user";
export const ADDRESS_LIST = "addressList";
export const PREVIOUS_PAGE_URL: string = "previouspageurl";
export const REFERENCE = "reference";
export const CHECK_YOUR_ANSWERS_FLAG = "checkYourAnswersFlag";
export const ACSP_DETAILS = "acspDetails";
export const BIOMETRIC_PASSPORT = "biometric_passport";
export const PASSPORT = "passport";
export const ACTIVE_STATUS = "active";
// Matomo
export const MATOMO_LINK_CLICK = "Click link";
// ID Document Details for the extended expiry date exceptions
const OPTION_1_BRP_GRACED_EXPIRY_IN_MONTHS = 18;
const OPTION_1_BIOMETRIC_PASSPORT_GRACED_EXPIRY_IN_MONTHS = 6;
const OPTION_1_IRISH_PASSPORT_CARD_GRACED_EXPIRY_IN_MONTHS = 6;
const OPTION_2_PASSPORT_GRACED_EXPIRY_IN_MONTHS = 18;
const OPTION_2_IRISH_PASSPORT_CARD_GRACED_EXPIRY_IN_MONTHS = 18;

export const OPTION_1_ID_DOCUMENTS_WITH_GRACED_EXPIRY = {
    UK_biometric_residence_permit: OPTION_1_BRP_GRACED_EXPIRY_IN_MONTHS,
    biometric_passport: OPTION_1_BIOMETRIC_PASSPORT_GRACED_EXPIRY_IN_MONTHS,
    irish_passport_card: OPTION_1_IRISH_PASSPORT_CARD_GRACED_EXPIRY_IN_MONTHS
};

export const OPTION_2_ID_DOCUMENTS_WITH_GRACED_EXPIRY = {
    irish_passport_card: OPTION_2_IRISH_PASSPORT_CARD_GRACED_EXPIRY_IN_MONTHS,
    passport: OPTION_2_PASSPORT_GRACED_EXPIRY_IN_MONTHS
};
