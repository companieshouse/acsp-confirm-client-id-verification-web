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
        const previousUrl: string = addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CONFIRM_IDENTITY_REVERIFICATION, lang);
        const locales = getLocalesService();
        const currentUrl: string = REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS;

        if (session.getExtraData(DATA_SUBMITTED_AND_EMAIL_SENT)) {
            return res.redirect(addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CONFIRMATION, lang));
        }
        saveDataInSession(req, CHECK_YOUR_ANSWERS_FLAG, true);

        const amlBodies = getAmlBodiesAsString(acspDetails);

        res.render(config.CHECK_YOUR_ANSWERS, {
            ...getLocaleInfo(locales, lang),
            currentUrl,
            previousUrl,
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
            res.status(400).render(config.CHECK_YOUR_ANSWERS, {
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

            const verifiedIdentity = await sendVerifiedClientDetails(identityVerificationService.prepareVerifiedClientData(clientData, req));
            saveDataInSession(req, REFERENCE, verifiedIdentity?.id);

            const clientVerificationEmailData: ClientVerificationEmail = {
                to: getLoggedInUserEmail(req.session),
                clientName: clientData.preferredFirstName + " " + clientData.preferredLastName,
                referenceNumber: verifiedIdentity?.id!,
                clientEmailAddress: clientData.emailAddress!
            };

            await sendIdentityVerificationConfirmationEmail(clientVerificationEmailData);

            session.setExtraData(DATA_SUBMITTED_AND_EMAIL_SENT, true);

            res.redirect(addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CONFIRMATION, lang));
        }
    } catch (error) {
        next(error);
    }
};
