import { Router } from "express";
import {
    accessibilityStatementController,
    healthCheckController,
    indexController,
    nameController,
    personalCodeController,
    homeAddressController,
    homeAddressManualController,
    confirmHomeAddressController,
    addressListController,
    dateOfBirthController,
    howIdentityDocumentsCheckedController,
    whenIdentityChecksCompletedController
} from "../controllers";

import * as urls from "../types/pageURL";
import { nameValidator } from "../validations/personName";
import { manualAddressValidator } from "../validations/homeAddressManual";
import { homeAddressValidator } from "../validations/homeAddress";
import { addressListValidator } from "../validations/addressList";
import { dateOfBirthValidator } from "../validations/dateOfBirth";
import { howIdentityDocsCheckedValidator } from "../validations/howIdentityDocsChecked";
import { identityChecksValidator } from "../validations/identityChecks";

const routes = Router();

routes.get(urls.HOME_URL, indexController.get);
routes.post(urls.HOME_URL, indexController.post);

routes.get(urls.ACCESSIBILITY_STATEMENT, accessibilityStatementController.get);

routes.get(urls.HEALTHCHECK, healthCheckController.get);

routes.get(urls.PERSONS_NAME, nameController.get);
routes.post(urls.PERSONS_NAME, nameValidator, nameController.post);

routes.get(urls.HOME_ADDRESS, homeAddressController.get);
routes.post(urls.HOME_ADDRESS, homeAddressValidator, homeAddressController.post);

routes.get(urls.CONFIRM_HOME_ADDRESS, confirmHomeAddressController.get);
routes.post(urls.CONFIRM_HOME_ADDRESS, confirmHomeAddressController.post);

routes.get(urls.PERSONAL_CODE, personalCodeController.get);
routes.post(urls.PERSONAL_CODE, personalCodeController.post);

routes.get(urls.HOME_ADDRESS_MANUAL, homeAddressManualController.get);
routes.post(urls.HOME_ADDRESS_MANUAL, manualAddressValidator, homeAddressManualController.post);

routes.get(urls.CHOOSE_AN_ADDRESS, addressListController.get);
routes.post(urls.CHOOSE_AN_ADDRESS, addressListValidator, addressListController.post);

routes.get(urls.DATE_OF_BIRTH, dateOfBirthController.get);
routes.post(urls.DATE_OF_BIRTH, dateOfBirthValidator, dateOfBirthController.post);

routes.get(urls.HOW_IDENTITY_DOCUMENTS_CHECKED, howIdentityDocumentsCheckedController.get);
routes.post(urls.HOW_IDENTITY_DOCUMENTS_CHECKED, howIdentityDocsCheckedValidator, howIdentityDocumentsCheckedController.post);

routes.get(urls.WHEN_IDENTITY_CHECKS_COMPLETED, whenIdentityChecksCompletedController.get);
routes.post(urls.WHEN_IDENTITY_CHECKS_COMPLETED, identityChecksValidator, whenIdentityChecksCompletedController.post);

export default routes;
