import { getEnvironmentValue } from "../utils/environment/environment_value";

const BASE_VIEWS_URL = "../views";
const BASE_PARTIALS_URL = `../views/partials`;

export const HOME = `${BASE_VIEWS_URL}/index/home`;

export const ACCESSIBILITY_STATEMENT = `${BASE_VIEWS_URL}/accessibility-statement/accessibility-statement`;
export const HOME_ADDRESS = `${BASE_VIEWS_URL}/home-address/home-address`;
export const CONFIRM_HOME_ADDRESS = `${BASE_VIEWS_URL}/confirm-home-address/confirm-home-address`;

export const ERROR_400 = `${BASE_PARTIALS_URL}/error_400`;
export const ERROR_404 = `${BASE_PARTIALS_URL}/error_404`;
export const ERROR_500 = `${BASE_PARTIALS_URL}/error_500`;

export const PIWIK_URL = getEnvironmentValue("PIWIK_URL");
export const PIWIK_SITE_ID = getEnvironmentValue("PIWIK_SITE_ID");
export const PIWIK_START_GOAL_ID = getEnvironmentValue("PIWIK_START_GOAL_ID");

export const PERSONS_NAME = `${BASE_VIEWS_URL}/persons-name/persons-name`;
export const PERSONAL_CODE = `${BASE_VIEWS_URL}/personal-code/personal-code`;
export const DATE_OF_BIRTH = `${BASE_VIEWS_URL}/what-is-their-date-of-birth/what-is-their-date-of-birth`;

export const HOME_ADDRESS_MANUAL = `${BASE_VIEWS_URL}/home-address-manual/home-address-manual`;
export const HOME_ADDRESS_LIST = `${BASE_VIEWS_URL}/home-address-list/home-address-list`;
export const IDENTITY_DOCUMETS_IDV = `${BASE_VIEWS_URL}/identity-documents-idv/identity-documents-idv`;
export const HOW_IDENTITY_DOCUMENTS_CHECKED = `${BASE_VIEWS_URL}/how-identity-documents-checked/how-identity-documents-checked`;

