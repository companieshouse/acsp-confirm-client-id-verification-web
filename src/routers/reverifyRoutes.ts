import { Router } from "express";
import * as urls from "../types/pageURL";
import { reverifySomeonesIdentityController } from "../controllers";

const reverifyRoutes = Router();

reverifyRoutes.get(urls.HOME_URL, reverifySomeonesIdentityController.get);
reverifyRoutes.post(urls.HOME_URL, reverifySomeonesIdentityController.post);

export default reverifyRoutes;
