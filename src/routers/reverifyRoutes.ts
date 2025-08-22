import { Router } from "express";
import * as urls from "../types/pageURL";
import {
    reverifySomeonesIdentityController,
    reverifyWhatIsThePersonsNameController,
    reverifyWhatWeShowOnPublicRegisterController,
    nameOnVerificationStatementController
} from "../controllers";
import { nameValidator } from "../validations/personName";
import { useNameOnPublicRegisterValidator } from "../validations/useNameOnPublicRegister";

const reverifyRoutes = Router();

reverifyRoutes.get(urls.HOME_URL, reverifySomeonesIdentityController.get);
reverifyRoutes.post(urls.HOME_URL, reverifySomeonesIdentityController.post);

reverifyRoutes.get(urls.REVERIFY_PERSONS_NAME, reverifyWhatIsThePersonsNameController.get);
reverifyRoutes.post(urls.REVERIFY_PERSONS_NAME, nameValidator, reverifyWhatIsThePersonsNameController.post);

reverifyRoutes.get(urls.REVERIFY_SHOW_ON_PUBLIC_REGISTER, reverifyWhatWeShowOnPublicRegisterController.get);
reverifyRoutes.post(urls.REVERIFY_SHOW_ON_PUBLIC_REGISTER, useNameOnPublicRegisterValidator, reverifyWhatWeShowOnPublicRegisterController.post);

reverifyRoutes.get(urls.REVERIFY_PERSONS_NAME_ON_PUBLIC_REGISTER, nameOnVerificationStatementController.get);
reverifyRoutes.post(urls.REVERIFY_PERSONS_NAME_ON_PUBLIC_REGISTER, nameValidator, nameOnVerificationStatementController.post);

export default reverifyRoutes;
