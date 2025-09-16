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
    reverifyPersonsEmailAddressController,
    reverifyHomeAddressManualController,
    whatIsTheirPersonalCodeController,
    identityDocumentsCheckedReverificationGroup2Controller,
    reverifyIdentityChecksCompletedController,
    reverifyIdentityDocumentsCheckedGroup1Controller,
    reverifyConfirmIdentityReverificationController,
    reverifyHowIdentityDocumentsWereCheckedController,
    reverifyChooseAnAddressController,
    reverifyCheckYourAnswersController
} from "../controllers";
import { personalCodeValidator } from "../validations/personalCode";
import { nameValidator } from "../validations/personName";
import { homeAddressValidator } from "../validations/homeAddress";
import { useNameOnPublicRegisterValidator } from "../validations/useNameOnPublicRegister";
import { dateValidator } from "../validations/dateValidationCommon";
import { emailValidator } from "../validations/personEmail";
import { reverifyIdentityDocsGroup1Validator } from "../validations/identityDocumentsGroup1";
import { manualAddressValidator } from "../validations/homeAddressManual";
import { identityDocsGroup2Validator } from "../validations/identityDocumentsGroup2";
import { confirmIdentityReverificationValidator } from "../validations/confirmIdentityVerification";
import { checkYourAnswerValidator } from "../validations/checkYourAnswer";
import { reverifyHowIdentityDocsCheckedValidator } from "../validations/howIdentityDocsChecked";
import { addressListValidator } from "../validations/addressList";

const reverifyRoutes = Router();

reverifyRoutes.get(urls.HOME_URL, reverifySomeonesIdentityController.get);
reverifyRoutes.post(urls.HOME_URL, reverifySomeonesIdentityController.post);

reverifyRoutes.get(urls.REVERIFY_PERSONAL_CODE, whatIsTheirPersonalCodeController.get);
reverifyRoutes.post(urls.REVERIFY_PERSONAL_CODE, personalCodeValidator, whatIsTheirPersonalCodeController.post);

reverifyRoutes.get(urls.REVERIFY_PERSONS_NAME, reverifyWhatIsThePersonsNameController.get);
reverifyRoutes.post(urls.REVERIFY_PERSONS_NAME, nameValidator, reverifyWhatIsThePersonsNameController.post);

reverifyRoutes.get(urls.REVERIFY_SHOW_ON_PUBLIC_REGISTER, reverifyWhatWeShowOnPublicRegisterController.get);
reverifyRoutes.post(urls.REVERIFY_SHOW_ON_PUBLIC_REGISTER, useNameOnPublicRegisterValidator, reverifyWhatWeShowOnPublicRegisterController.post);

reverifyRoutes.get(urls.REVERIFY_PERSONS_NAME_ON_PUBLIC_REGISTER, nameOnVerificationStatementController.get);
reverifyRoutes.post(urls.REVERIFY_PERSONS_NAME_ON_PUBLIC_REGISTER, nameValidator, nameOnVerificationStatementController.post);

reverifyRoutes.get(urls.REVERIFY_DATE_OF_BIRTH, reverifyDateOfBirthController.get);
reverifyRoutes.post(urls.REVERIFY_DATE_OF_BIRTH, dateValidator("dob"), reverifyDateOfBirthController.post);

reverifyRoutes.get(urls.REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS, whatIsTheirHomeAddressController.get);
reverifyRoutes.post(urls.REVERIFY_WHAT_IS_THEIR_HOME_ADDRESS, homeAddressValidator, whatIsTheirHomeAddressController.post);

reverifyRoutes.get(urls.REVERIFY_HOME_ADDRESS_MANUAL, reverifyHomeAddressManualController.get);
reverifyRoutes.post(urls.REVERIFY_HOME_ADDRESS_MANUAL, manualAddressValidator, reverifyHomeAddressManualController.post);

reverifyRoutes.get(urls.REVERIFY_CHOOSE_AN_ADDRESS, reverifyChooseAnAddressController.get);
reverifyRoutes.post(urls.REVERIFY_CHOOSE_AN_ADDRESS, addressListValidator("reverify"), reverifyChooseAnAddressController.post);

reverifyRoutes.get(urls.REVERIFY_CONFIRM_HOME_ADDRESS, reverifyConfirmHomeAddressController.get);
reverifyRoutes.post(urls.REVERIFY_CONFIRM_HOME_ADDRESS, reverifyConfirmHomeAddressController.post);

reverifyRoutes.get(urls.REVERIFY_WHEN_IDENTITY_CHECKS_COMPLETED, reverifyIdentityChecksCompletedController.get);
reverifyRoutes.post(urls.REVERIFY_WHEN_IDENTITY_CHECKS_COMPLETED, dateValidator("wicc"), reverifyIdentityChecksCompletedController.post);

reverifyRoutes.get(urls.REVERIFY_PERSONS_EMAIL_ADDRESS, reverifyPersonsEmailAddressController.get);
reverifyRoutes.post(urls.REVERIFY_PERSONS_EMAIL_ADDRESS, emailValidator, reverifyPersonsEmailAddressController.post);

reverifyRoutes.get(urls.REVERIFY_HOW_IDENTITY_DOCUMENTS_CHECKED, reverifyHowIdentityDocumentsWereCheckedController.get);
reverifyRoutes.post(urls.REVERIFY_HOW_IDENTITY_DOCUMENTS_CHECKED, reverifyHowIdentityDocsCheckedValidator, reverifyHowIdentityDocumentsWereCheckedController.post);

reverifyRoutes.get(urls.REVERIFY_WHICH_IDENTITY_DOCS_CHECKED_GROUP1, reverifyIdentityDocumentsCheckedGroup1Controller.get);
reverifyRoutes.post(urls.REVERIFY_WHICH_IDENTITY_DOCS_CHECKED_GROUP1, reverifyIdentityDocsGroup1Validator, reverifyIdentityDocumentsCheckedGroup1Controller.post);

reverifyRoutes.get(urls.REVERIFY_WHICH_IDENTITY_DOCS_CHECKED_GROUP2, identityDocumentsCheckedReverificationGroup2Controller.get);
reverifyRoutes.post(urls.REVERIFY_WHICH_IDENTITY_DOCS_CHECKED_GROUP2, identityDocsGroup2Validator, identityDocumentsCheckedReverificationGroup2Controller.post);

reverifyRoutes.get(urls.REVERIFY_CONFIRM_IDENTITY_REVERIFICATION, reverifyConfirmIdentityReverificationController.get);
reverifyRoutes.post(urls.REVERIFY_CONFIRM_IDENTITY_REVERIFICATION, confirmIdentityReverificationValidator, reverifyConfirmIdentityReverificationController.post);

reverifyRoutes.get(urls.CHECK_YOUR_ANSWERS, reverifyCheckYourAnswersController.get);
reverifyRoutes.post(urls.CHECK_YOUR_ANSWERS, checkYourAnswerValidator, reverifyCheckYourAnswersController.post);

export default reverifyRoutes;
