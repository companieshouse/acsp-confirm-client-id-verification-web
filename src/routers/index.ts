import { Router } from "express";
import {
    accessibilityStatementController,
    healthCheckController,
    indexController,
    nameController
} from "../controllers";

import * as urls from "../types/pageURL";
import { nameValidator } from "../validations/personName";

const routes = Router();

routes.get(urls.HOME_URL, indexController.get);
routes.post(urls.HOME_URL, indexController.post);

routes.get(urls.ACCESSIBILITY_STATEMENT, accessibilityStatementController.get);

routes.get(urls.HEALTHCHECK, healthCheckController.get);

routes.get(urls.PERSONS_NAME, nameController.get);
routes.post(urls.PERSONS_NAME, nameValidator, nameController.post);

export default routes;
