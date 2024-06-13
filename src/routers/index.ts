import { Router } from "express";
import {
    accessibilityStatementController,
    healthCheckController,
    indexController
} from "../controllers";

import * as urls from "../types/pageURL";

const routes = Router();

routes.get(urls.HOME_URL, indexController.get);
routes.post(urls.HOME_URL, indexController.post);

routes.get(urls.ACCESSIBILITY_STATEMENT, accessibilityStatementController.get);

routes.get(urls.HEALTHCHECK, healthCheckController.get);

export default routes;
