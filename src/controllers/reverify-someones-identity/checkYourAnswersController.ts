import { NextFunction, Request, Response } from "express";
import { selectLang, addLangToUrl, getLocalesService, getLocaleInfo } from "../../utils/localise";
import * as config from "../../config";
import { REVERIFY_BASE_URL, REVERIFY_CHECK_YOUR_ANSWERS, REVERIFY_CONFIRM_IDENTITY_REVERIFICATION, REVERIFY_CONFIRMATION } from "../../types/pageURL";
import { USER_DATA, REFERENCE, CHECK_YOUR_ANSWERS_FLAG, ACSP_DETAILS, CEASED, DATA_SUBMITTED_AND_EMAIL_SENT, USE_NAME_ON_PUBLIC_REGISTER_NO, HAS_SUBMITTED_APPLICATION } from "../../utils/constants";
import { ClientData } from "../../model/ClientData";
import { Session } from "@companieshouse/node-session-handler";
import { FormatService } from "../../services/formatService";
import { validationResult } from "express-validator";
import { formatValidationError, getPageProperties } from "../../validations/validation";
import { saveDataInSession } from "../../utils/sessionHelper";
import { AcspFullProfile } from "private-api-sdk-node/dist/services/acsp-profile/types";
import { getAcspFullProfile, getAmlBodiesAsString } from "../../services/acspProfileService";
import { sendIdentityConfirmationEmail } from "../../services/acspEmailService";
import { getLoggedInAcspNumber, getLoggedInUserEmail } from "../../utils/session";
import { ClientVerificationEmail } from "@companieshouse/api-sdk-node/dist/services/acsp/types";
import { AcspCeasedError } from "../../errors/acspCeasedError";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session: Session = req.session as any as Session;
        const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};
        const acspDetails: AcspFullProfile = session.getExtraData(ACSP_DETAILS)!;
        const lang = selectLang(req.query.lang);
        const previousPage: string = addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CONFIRM_IDENTITY_REVERIFICATION, lang);
        const locales = getLocalesService();
        const currentUrl: string = REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS;

        // Check if user has submitted an application (value is set to true when navigating back from confirmation screen)
        const hasSubmittedApplication = session.getExtraData(HAS_SUBMITTED_APPLICATION);

        // If the user has submitted an application, then they are navigating from the confirmation screen
        // User should then be redirected to start page of the service
        if (hasSubmittedApplication) {
            session.deleteExtraData(USER_DATA);
            session.deleteExtraData(CHECK_YOUR_ANSWERS_FLAG);
            session.deleteExtraData(REFERENCE);
            session.deleteExtraData(DATA_SUBMITTED_AND_EMAIL_SENT);
            session.deleteExtraData(HAS_SUBMITTED_APPLICATION);
            return res.redirect(addLangToUrl(REVERIFY_BASE_URL, lang));
        }

        if (session.getExtraData(DATA_SUBMITTED_AND_EMAIL_SENT)) {
            return res.redirect(addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CONFIRMATION, lang));
        }
        // setting CYA flag to true when user reaches this page - used for routing back if they change a value
        saveDataInSession(req, CHECK_YOUR_ANSWERS_FLAG, true);

        const amlBodies = getAmlBodiesAsString(acspDetails);

        const formattedDocumentsChecked = FormatService.formatDocumentsChecked(
            clientData.documentsChecked,
            locales.i18nCh.resolveNamespacesKeys(lang)
        );

        const formattedwhenIdentityChecksCompleted = FormatService.formatDate(
            clientData.whenIdentityChecksCompleted
                ? new Date(clientData.whenIdentityChecksCompleted)
                : undefined
        );

        res.render(config.REVERIFY_CHECK_YOUR_ANSWERS, {
            ...getLocaleInfo(locales, lang),
            currentUrl,
            previousPage,
            clientData: {
                ...clientData,
                address: FormatService.formatAddress(clientData.address),
                dateOfBirth: FormatService.formatDate(clientData.dateOfBirth ? new Date(clientData.dateOfBirth) : undefined),
                whenIdentityChecksCompleted: formattedwhenIdentityChecksCompleted,
                documentsChecked: formattedDocumentsChecked,
                idDocumentDetails: clientData.idDocumentDetails!,
                reverifyBaseUrl: REVERIFY_BASE_URL
            },
            amlBodies,
            acspName: acspDetails.name
        });
    } catch (error) {
        next(error);
    }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session: Session = req.session as any as Session;
        const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};
        const acspDetails: AcspFullProfile = session.getExtraData(ACSP_DETAILS)!;
        const locales = getLocalesService();
        const lang = selectLang(req.query.lang);
        const errorList = validationResult(req);
        const currentUrl: string = REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS;
        const previousPage: string = addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CONFIRM_IDENTITY_REVERIFICATION, lang);

        if (!errorList.isEmpty()) {
            const amlBodies = getAmlBodiesAsString(acspDetails);

            const pageProperties = getPageProperties(formatValidationError(errorList.array(), lang));
            res.status(400).render(config.REVERIFY_CHECK_YOUR_ANSWERS, {
                previousPage,
                ...getLocaleInfo(locales, lang),
                currentUrl,
                ...pageProperties,
                clientData: {
                    ...clientData,
                    address: FormatService.formatAddress(clientData.address),
                    dateOfBirth: FormatService.formatDate(clientData.dateOfBirth ? new Date(clientData.dateOfBirth) : undefined),
                    whenIdentityChecksCompleted: FormatService.formatDate(clientData.whenIdentityChecksCompleted ? new Date(clientData.whenIdentityChecksCompleted) : undefined),
                    documentsChecked: FormatService.formatDocumentsChecked(clientData.documentsChecked, locales.i18nCh.resolveNamespacesKeys(lang)),
                    idDocumentDetails: clientData.idDocumentDetails!
                },
                amlBodies,
                acspName: acspDetails.name
            });
        } else {
            if (session.getExtraData(DATA_SUBMITTED_AND_EMAIL_SENT)) {
                return res.redirect(addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CONFIRMATION, lang));
            }

            const acspNumber: string = getLoggedInAcspNumber(req.session);
            const acspDetails = await getAcspFullProfile(acspNumber);
            session.setExtraData(ACSP_DETAILS, acspDetails);

            if (acspDetails.status === CEASED) {
                throw new AcspCeasedError("ACSP is ceased. Cannot proceed with reverification");
            }

            // const identityVerificationService = new IdentityVerificationService();

            // TO DO: Call new PATCH endpoint with reverification details once developed
            // const verifiedIdentity = await sendVerifiedClientDetails(identityVerificationService.prepareVerifiedClientData(clientData, req));
            const verifiedIdentityId = "123456"; // TO BE REMOVED: temporary id until endpoint developed
            saveDataInSession(req, REFERENCE, verifiedIdentityId);

            const clientReverificationEmailData: ClientVerificationEmail = {
                to: getLoggedInUserEmail(req.session),
                clientName: getClientFullName(clientData),
                referenceNumber: verifiedIdentityId,
                clientEmailAddress: clientData.emailAddress!
            };

            await sendIdentityConfirmationEmail(clientReverificationEmailData, "reverification");

            session.setExtraData(DATA_SUBMITTED_AND_EMAIL_SENT, true);

            res.redirect(addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CONFIRMATION, lang));
        }
    } catch (error) {
        next(error);
    }
};

export const getClientFullName = (clientData: ClientData): string => {
    if (clientData.useNameOnPublicRegister === USE_NAME_ON_PUBLIC_REGISTER_NO) {
        return clientData.preferredFirstName + " " + clientData.preferredLastName;
    } else {
        return clientData.firstName + " " + clientData.lastName;
    }
};
