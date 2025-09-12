import { NextFunction, Request, Response } from "express";
import { selectLang, addLangToUrl, getLocalesService, getLocaleInfo } from "../../utils/localise";
import * as config from "../../config";
import { REVERIFY_BASE_URL, REVERIFY_CHECK_YOUR_ANSWERS, REVERIFY_CONFIRM_IDENTITY_REVERIFICATION, REVERIFY_CONFIRMATION } from "../../types/pageURL";
import { USER_DATA, REFERENCE, CHECK_YOUR_ANSWERS_FLAG, ACSP_DETAILS, CEASED, DATA_SUBMITTED_AND_EMAIL_SENT } from "../../utils/constants";
import { ClientData } from "../../model/ClientData";
import { Session } from "@companieshouse/node-session-handler";
import { FormatService } from "../../services/formatService";
import { validationResult } from "express-validator";
import { formatValidationError, getPageProperties } from "../../validations/validation";
import { findIdentityByEmail, IdentityVerificationService, sendVerifiedClientDetails } from "../../services/identityVerificationService";
import { saveDataInSession } from "../../utils/sessionHelper";
import { AcspFullProfile } from "private-api-sdk-node/dist/services/acsp-profile/types";
import { getAcspFullProfile, getAmlBodiesAsString } from "../../services/acspProfileService";
import { sendIdentityVerificationConfirmationEmail } from "../../services/acspEmailService";
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

        if (session.getExtraData(DATA_SUBMITTED_AND_EMAIL_SENT)) {
            return res.redirect(addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CONFIRMATION, lang));
        }
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
        const session: Session = req.session as any as Session;
        const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};
        const acspDetails: AcspFullProfile = session.getExtraData(ACSP_DETAILS)!;
        const locales = getLocalesService();
        const lang = selectLang(req.query.lang);
        const errorList = validationResult(req);
        const currentUrl: string = REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS;
        const previousPage: string = addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CONFIRM_IDENTITY_REVERIFICATION, lang);

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
            if (session.getExtraData(DATA_SUBMITTED_AND_EMAIL_SENT)) {
                return res.redirect(addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CONFIRMATION, lang));
            }

            const identityFromEmail = await findIdentityByEmail(clientData.emailAddress!);
            if (identityFromEmail !== undefined) {
                throw new Error("Email address already exists");
            }

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

            await sendIdentityVerificationConfirmationEmail(emailData);

            session.setExtraData(DATA_SUBMITTED_AND_EMAIL_SENT, true);

            res.redirect(addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CONFIRMATION, lang));
        }
    } catch (error) {
        next(error);
    }
};
