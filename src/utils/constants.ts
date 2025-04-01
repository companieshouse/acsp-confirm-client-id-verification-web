export const USER_DATA = "user";
export const ADDRESS_LIST = "addressList";
export const PREVIOUS_PAGE_URL: string = "previouspageurl";
export const REFERENCE = "reference";
export const CHECK_YOUR_ANSWERS_FLAG = "checkYourAnswersFlag";
export const ACSP_DETAILS = "acspDetails";
export const BIOMETRIC_PASSPORT = "biometric_passport";
export const PASSPORT = "passport";

const BRP_GRACED_EXPIRY = 18;

export const ID_DOCUMENTS_WITH_GRACED_EXPIRY = new Map<string, number>([
    ["UK_biometric_residence_permit", BRP_GRACED_EXPIRY]
]);

// Matomo
export const MATOMO_LINK_CLICK = "Click link";
