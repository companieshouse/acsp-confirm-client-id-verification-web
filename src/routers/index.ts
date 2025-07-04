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
    identityDocumentsCheckedGroup1Controller,
    identityDocumentsCheckedGroup2Controller,
    howIdentityDocumentsCheckedController,
    personsEmailController,
    whenIdentityChecksCompletedController,
    checkYourAnswersController,
    confirmIdentityVerificationController,
    signOutController,
    confirmationController,
    provideDifferentEmailController,
    confirmationRedirectController,
    idDocumentDetailsController,
    useNameOnPublicRegisterController,
    personsPublicRegisterNameController,
    cannotUseServiceWhileSuspendedController,
    mustBeAnAuthorisedAgentController

} from "../controllers";

import * as urls from "../types/pageURL";
import { nameValidator } from "../validations/personName";
import { manualAddressValidator } from "../validations/homeAddressManual";
import { homeAddressValidator } from "../validations/homeAddress";
import { addressListValidator } from "../validations/addressList";
import { emailValidator } from "../validations/personEmail";
import { dateValidator } from "../validations/dateValidationCommon";
import { howIdentityDocsCheckedValidator } from "../validations/howIdentityDocsChecked";
import { identityDocsGroup1Validator } from "../validations/identityDocumentsGroup1";
import { identityDocsGroup2Validator } from "../validations/identityDocumentsGroup2";
import { confirmIdentityVerificationValidator } from "../validations/confirmIdentityVerification";
import { selectsignOutValidator } from "../validations/signOut";
import { checkYourAnswerValidator } from "../validations/checkYourAnswer";
import idDocumentDetailsValidator from "../validations/idDocumentDetails";
import { useNameOnPublicRegisterValidator } from "../validations/useNameOnPublicRegister";

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
routes.post(urls.DATE_OF_BIRTH, dateValidator("dob"), dateOfBirthController.post);

routes.get(urls.WHICH_IDENTITY_DOCS_CHECKED_GROUP1, identityDocumentsCheckedGroup1Controller.get);
routes.post(urls.WHICH_IDENTITY_DOCS_CHECKED_GROUP1, identityDocsGroup1Validator, identityDocumentsCheckedGroup1Controller.post);

routes.get(urls.WHICH_IDENTITY_DOCS_CHECKED_GROUP2, identityDocumentsCheckedGroup2Controller.get);
routes.post(urls.WHICH_IDENTITY_DOCS_CHECKED_GROUP2, identityDocsGroup2Validator, identityDocumentsCheckedGroup2Controller.post);

routes.get(urls.HOW_IDENTITY_DOCUMENTS_CHECKED, howIdentityDocumentsCheckedController.get);
routes.post(urls.HOW_IDENTITY_DOCUMENTS_CHECKED, howIdentityDocsCheckedValidator, howIdentityDocumentsCheckedController.post);

routes.get(urls.WHEN_IDENTITY_CHECKS_COMPLETED, whenIdentityChecksCompletedController.get);
routes.post(urls.WHEN_IDENTITY_CHECKS_COMPLETED, dateValidator("wicc"), whenIdentityChecksCompletedController.post);

routes.get(urls.EMAIL_ADDRESS, personsEmailController.get);
routes.post(urls.EMAIL_ADDRESS, emailValidator, personsEmailController.post);

routes.get(urls.PROVIDE_DIFFERENT_EMAIL, provideDifferentEmailController.get);

routes.get(urls.CONFIRM_IDENTITY_VERIFICATION, confirmIdentityVerificationController.get);
routes.post(urls.CONFIRM_IDENTITY_VERIFICATION, confirmIdentityVerificationValidator, confirmIdentityVerificationController.post);

routes.get(urls.SIGN_OUT_URL, signOutController.get);
routes.post(urls.SIGN_OUT_URL, selectsignOutValidator, signOutController.post);

routes.get(urls.CONFIRMATION, confirmationController.get);
routes.get(urls.CHECK_YOUR_ANSWERS, checkYourAnswersController.get);
routes.post(urls.CHECK_YOUR_ANSWERS, checkYourAnswerValidator, checkYourAnswersController.post);

routes.get(urls.CONFIRMATION_REDIRECT, confirmationRedirectController.get);

routes.get(urls.ID_DOCUMENT_DETAILS, idDocumentDetailsController.get);
routes.post(urls.ID_DOCUMENT_DETAILS, idDocumentDetailsValidator.call(this), idDocumentDetailsController.post);

routes.get(urls.USE_NAME_ON_PUBLIC_REGISTER, useNameOnPublicRegisterController.get);
routes.post(urls.USE_NAME_ON_PUBLIC_REGISTER, useNameOnPublicRegisterValidator, useNameOnPublicRegisterController.post);

routes.get(urls.PERSONS_NAME_ON_PUBLIC_REGISTER, personsPublicRegisterNameController.get);
routes.post(urls.PERSONS_NAME_ON_PUBLIC_REGISTER, nameValidator, personsPublicRegisterNameController.post);

routes.get(urls.CANNOT_USE_SERVICE_WHILE_SUSPENDED, cannotUseServiceWhileSuspendedController.get);

routes.get(urls.MUST_BE_AUTHORISED_AGENT, mustBeAnAuthorisedAgentController.get);

export default routes;
