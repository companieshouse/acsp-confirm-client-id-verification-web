import { Router } from "express";
import * as urls from "../types/pageURL";
import {
    reverifySomeonesIdentityController,
    nameOnVerificationStatementController
} from "../controllers";
import { nameValidator } from "../validations/personName";

const reverifyRoutes = Router();

reverifyRoutes.get(urls.HOME_URL, reverifySomeonesIdentityController.get);
reverifyRoutes.post(urls.HOME_URL, reverifySomeonesIdentityController.post);

reverifyRoutes.get(urls.REVERIFY_PERSONS_NAME_ON_PUBLIC_REGISTER, nameOnVerificationStatementController.get);
reverifyRoutes.post(urls.REVERIFY_PERSONS_NAME_ON_PUBLIC_REGISTER, nameValidator, nameOnVerificationStatementController.post);

export default reverifyRoutes;
