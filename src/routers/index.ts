import { Router } from "express";
import {
    accessibilityStatementController,
    healthCheckController,
    indexController,
    nameController,
    personalCodeController,
    homeAddressManualController
} from "../controllers";

import * as urls from "../types/pageURL";
import { nameValidator } from "../validations/personName";
import { manualAddressValidator } from "../validations/homeAddressManual";

const routes = Router();

routes.get(urls.HOME_URL, indexController.get);
routes.post(urls.HOME_URL, indexController.post);

routes.get(urls.ACCESSIBILITY_STATEMENT, accessibilityStatementController.get);

routes.get(urls.HEALTHCHECK, healthCheckController.get);

routes.get(urls.PERSONS_NAME, nameController.get);
routes.post(urls.PERSONS_NAME, nameValidator, nameController.post);

routes.get(urls.PERSONAL_CODE, personalCodeController.get);
routes.post(urls.PERSONAL_CODE, personalCodeController.post);

routes.get(urls.HOME_ADDRESS_MANUAL, homeAddressManualController.get);
routes.post(urls.HOME_ADDRESS_MANUAL, manualAddressValidator, homeAddressManualController.post);

export default routes;
