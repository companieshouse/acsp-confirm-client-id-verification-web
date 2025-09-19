import { NextFunction, Request, Response } from "express";
import { selectLang, addLangToUrl, getLocalesService, getLocaleInfo } from "../utils/localise";
import * as config from "../config";
import { BASE_URL, CHECK_YOUR_ANSWERS, CONFIRM_IDENTITY_VERIFICATION, CONFIRMATION } from "../types/pageURL";
import { USER_DATA, REFERENCE, CHECK_YOUR_ANSWERS_FLAG, ACSP_DETAILS, CEASED, DATA_SUBMITTED_AND_EMAIL_SENT } from "../utils/constants";
import { ClientData } from "../model/ClientData";
import { Session } from "@companieshouse/node-session-handler";
import { FormatService } from "../services/formatService";
import { validationResult } from "express-validator";
import { formatValidationError, getPageProperties } from "../validations/validation";
import { findIdentityByEmail, IdentityVerificationService, sendVerifiedClientDetails } from "../services/identityVerificationService";
import { saveDataInSession } from "../utils/sessionHelper";
import { AcspFullProfile } from "private-api-sdk-node/dist/services/acsp-profile/types";
import { getAcspFullProfile, getAmlBodiesAsString } from "../services/acspProfileService";
import { sendIdentityConfirmationEmail } from "../services/acspEmailService";
import { getLoggedInAcspNumber, getLoggedInUserEmail } from "../utils/session";
import { ClientVerificationEmail } from "@companieshouse/api-sdk-node/dist/services/acsp/types";
import { AcspCeasedError } from "../errors/acspCeasedError";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const previousPage: string = addLangToUrl(BASE_URL + CONFIRM_IDENTITY_VERIFICATION, lang);
        const currentUrl: string = BASE_URL + CHECK_YOUR_ANSWERS;
        const session: Session = req.session as any as Session;
        const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};
        const acspDetails: AcspFullProfile = session.getExtraData(ACSP_DETAILS)!;

        // Redirect to confirmation page if the data has already been submitted
        // This is if user refreshes Check Your Answers page URL in browser
        if (session.getExtraData(DATA_SUBMITTED_AND_EMAIL_SENT)) {
            return res.redirect(addLangToUrl(BASE_URL + CONFIRMATION, lang));
        }

        // setting CYA flag to true when user reaches this page - used for routing back if they change a value
        saveDataInSession(req, CHECK_YOUR_ANSWERS_FLAG, true);

        const formattedAddress = FormatService.formatAddress(clientData.address);
        const formattedDateOfBirth = FormatService.formatDate(
            clientData.dateOfBirth ? new Date(clientData.dateOfBirth) : undefined
        );
        const formattedwhenIdentityChecksCompleted = FormatService.formatDate(
            clientData.whenIdentityChecksCompleted
                ? new Date(clientData.whenIdentityChecksCompleted)
                : undefined
        );

        const formattedDocumentsChecked = FormatService.formatDocumentsChecked(
            clientData.documentsChecked,
            locales.i18nCh.resolveNamespacesKeys(lang)
        );

        const identityDocuments = clientData.idDocumentDetails!;

        const amlBodies = getAmlBodiesAsString(acspDetails);

        res.render(config.CHECK_YOUR_ANSWERS, {
            ...getLocaleInfo(locales, lang),
            currentUrl,
            previousPage,
            clientData: {
                ...clientData,
                address: formattedAddress,
                dateOfBirth: formattedDateOfBirth,
                whenIdentityChecksCompleted: formattedwhenIdentityChecksCompleted,
                documentsChecked: formattedDocumentsChecked,
                idDocumentDetails: identityDocuments
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
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const errorList = validationResult(req);
        const previousPage: string = addLangToUrl(BASE_URL + CONFIRM_IDENTITY_VERIFICATION, lang);
        const currentUrl: string = BASE_URL + CHECK_YOUR_ANSWERS;
        const session: Session = req.session as any as Session;
        const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};
        const acspDetails: AcspFullProfile = session.getExtraData(ACSP_DETAILS)!;

        if (!errorList.isEmpty()) {
            const formattedAddress = FormatService.formatAddress(clientData.address);
            const formattedDateOfBirth = FormatService.formatDate(
                clientData.dateOfBirth ? new Date(clientData.dateOfBirth) : undefined
            );
            const formattedwhenIdentityChecksCompleted = FormatService.formatDate(
                clientData.whenIdentityChecksCompleted
                    ? new Date(clientData.whenIdentityChecksCompleted)
                    : undefined
            );

            const formattedDocumentsChecked = FormatService.formatDocumentsChecked(
                clientData.documentsChecked,
                locales.i18nCh.resolveNamespacesKeys(lang)
            );

            const amlBodies = getAmlBodiesAsString(acspDetails);
            const identityDocuments = clientData.idDocumentDetails!;

            const pageProperties = getPageProperties(formatValidationError(errorList.array(), lang));
            res.status(400).render(config.CHECK_YOUR_ANSWERS, {
                previousPage,
                ...getLocaleInfo(locales, lang),
                currentUrl,
                ...pageProperties,
                clientData: {
                    ...clientData,
                    address: formattedAddress,
                    dateOfBirth: formattedDateOfBirth,
                    whenIdentityChecksCompleted: formattedwhenIdentityChecksCompleted,
                    documentsChecked: formattedDocumentsChecked,
                    idDocumentDetails: identityDocuments
                },
                amlBodies,
                acspName: acspDetails.name
            });
        } else {

            // Redirect to confirmation page if the data has already been submitted
            // This is if user refreshes browswer and selects to resubmit the form
            if (session.getExtraData(DATA_SUBMITTED_AND_EMAIL_SENT)) {
                return res.redirect(addLangToUrl(BASE_URL + CONFIRMATION, lang));
            }

            const identityFromEmail = await findIdentityByEmail(clientData.emailAddress!);
            if (identityFromEmail !== undefined) {
                throw new Error("Email address already exists");
            }

            // Check the ACSP's status and if they are ceased throw an error
            const acspNumber: string = getLoggedInAcspNumber(req.session);
            const acspDetails = await getAcspFullProfile(acspNumber);
            session.setExtraData(ACSP_DETAILS, acspDetails);

            if (acspDetails.status === CEASED) {
                throw new AcspCeasedError("ACSP is ceased. Cannot proceed with verification.");
            }

            const identityVerificationService = new IdentityVerificationService();
            const verifiedClientData = identityVerificationService.prepareVerifiedClientData(clientData, req);

            const verifiedIdentity = await sendVerifiedClientDetails(verifiedClientData);
            saveDataInSession(req, REFERENCE, verifiedIdentity?.id);

            const emailData: ClientVerificationEmail = {
                to: getLoggedInUserEmail(req.session),
                clientName: clientData.preferredFirstName + " " + clientData.preferredLastName,
                referenceNumber: verifiedIdentity?.id!,
                clientEmailAddress: clientData.emailAddress!
            };

            await sendIdentityConfirmationEmail(emailData, "verification");

            // Sets a flag for when data is sent to verification api and email is sent
            // If user faces issue before seeing confirmation page we use this flag to check and redirect if they refresh
            session.setExtraData(DATA_SUBMITTED_AND_EMAIL_SENT, true);

            res.redirect(addLangToUrl(BASE_URL + CONFIRMATION, lang));

        }
    } catch (error) {
        next(error);
    }
};
