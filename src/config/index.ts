import { getEnvironmentValue } from "../utils/environment/environment_value";

const BASE_VIEWS_URL = "../views";
const BASE_PARTIALS_URL = `../views/partials`;

export const HOME = `${BASE_VIEWS_URL}/index/home`;

export const ACCESSIBILITY_STATEMENT = `${BASE_VIEWS_URL}/accessibility-statement/accessibility-statement`;

export const ERROR_400 = `${BASE_PARTIALS_URL}/error_400`;
export const ERROR_404 = `${BASE_PARTIALS_URL}/error_404`;
export const ERROR_500 = `${BASE_PARTIALS_URL}/error_500`;

export const PIWIK_URL = getEnvironmentValue("PIWIK_URL");
export const PIWIK_SITE_ID = getEnvironmentValue("PIWIK_SITE_ID");
export const PIWIK_START_GOAL_ID = getEnvironmentValue("PIWIK_START_GOAL_ID");

export const PERSONS_NAME = `${BASE_VIEWS_URL}/persons-name/persons-name`;
export const PERSONAL_CODE = `${BASE_VIEWS_URL}/personal-code/personal-code`;

export const HOME_ADDRESS_MANUAL = `${BASE_VIEWS_URL}/home-address-manual/home-address-manual`;
