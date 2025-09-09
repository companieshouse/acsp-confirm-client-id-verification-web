import { Router } from "express";
import * as urls from "../types/pageURL";
import {
    reverifySomeonesIdentityController,
    reverifyWhatIsThePersonsNameController,
    reverifyWhatWeShowOnPublicRegisterController,
    nameOnVerificationStatementController,
    whatIsTheirHomeAddressController,
    reverifyDateOfBirthController,
    reverifyConfirmHomeAddressController,
    reverifyHomeAddressManualController
} from "../controllers";
import { nameValidator } from "../validations/personName";
import { homeAddressValidator } from "../validations/homeAddress";
import { useNameOnPublicRegisterValidator } from "../validations/useNameOnPublicRegister";
import { dateValidator } from "../validations/dateValidationCommon";

const reverifyRoutes = Router();

reverifyRoutes.get(urls.HOME_URL, reverifySomeonesIdentityController.get);
reverifyRoutes.post(urls.HOME_URL, reverifySomeonesIdentityController.post);

reverifyRoutes.get(urls.REVERIFY_PERSONS_NAME, reverifyWhatIsThePersonsNameController.get);
reverifyRoutes.post(urls.REVERIFY_PERSONS_NAME, nameValidator, reverifyWhatIsThePersonsNameController.post);

reverifyRoutes.get(urls.REVERIFY_SHOW_ON_PUBLIC_REGISTER, reverifyWhatWeShowOnPublicRegisterController.get);
reverifyRoutes.post(urls.REVERIFY_SHOW_ON_PUBLIC_REGISTER, useNameOnPublicRegisterValidator, reverifyWhatWeShowOnPublicRegisterController.post);

reverifyRoutes.get(urls.REVERIFY_PERSONS_NAME_ON_PUBLIC_REGISTER, nameOnVerificationStatementController.get);
reverifyRoutes.post(urls.REVERIFY_PERSONS_NAME_ON_PUBLIC_REGISTER, nameValidator, nameOnVerificationStatementController.post);

reverifyRoutes.get(urls.REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS, whatIsTheirHomeAddressController.get);
reverifyRoutes.post(urls.REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS, homeAddressValidator, whatIsTheirHomeAddressController.post);

reverifyRoutes.get(urls.REVERIFY_DATE_OF_BIRTH, reverifyDateOfBirthController.get);
reverifyRoutes.post(urls.REVERIFY_DATE_OF_BIRTH, dateValidator("dob"), reverifyDateOfBirthController.post);

reverifyRoutes.get(urls.REVERIFY_CONFIRM_HOME_ADDRESS, reverifyConfirmHomeAddressController.get);
reverifyRoutes.post(urls.REVERIFY_CONFIRM_HOME_ADDRESS, reverifyConfirmHomeAddressController.post);

reverifyRoutes.get(urls.REVERIFY_HOME_ADDRESS_MANUAL, reverifyHomeAddressManualController.get);
reverifyRoutes.post(urls.REVERIFY_HOME_ADDRESS_MANUAL, reverifyHomeAddressManualController.post);

export default reverifyRoutes;
