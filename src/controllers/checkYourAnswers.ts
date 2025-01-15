import { NextFunction, Request, Response } from "express";
import { selectLang, addLangToUrl, getLocalesService, getLocaleInfo } from "../utils/localise";
import * as config from "../config";
import { BASE_URL, CHECK_YOUR_ANSWERS, CONFIRM_IDENTITY_VERIFICATION, CONFIRMATION, PROVIDE_DIFFERENT_EMAIL } from "../types/pageURL";
import { USER_DATA, REFERENCE, MATOMO_BUTTON_CLICK, CHECK_YOUR_ANSWERS_FLAG, ACSP_DETAILS } from "../utils/constants";
import { ClientData } from "../model/ClientData";
import { Session } from "@companieshouse/node-session-handler";
import { FormatService } from "../services/formatService";
import { validationResult } from "express-validator";
import { formatValidationError, getPageProperties } from "../validations/validation";
import { findIdentityByEmail, IdentityVerificationService, sendVerifiedClientDetails } from "../services/identityVerificationService";
import logger from "../utils/logger";
import { ErrorService } from "../services/errorService";
import { saveDataInSession } from "../utils/sessionHelper";
import { AcspFullProfile } from "private-api-sdk-node/dist/services/acsp-profile/types";
import { getAmlBodiesAsString } from "../services/acspProfileService";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const previousPage: string = addLangToUrl(BASE_URL + CONFIRM_IDENTITY_VERIFICATION, lang);
    const currentUrl: string = BASE_URL + CHECK_YOUR_ANSWERS;
    const session: Session = req.session as any as Session;
    const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};
    const acspDetails: AcspFullProfile = session.getExtraData(ACSP_DETAILS)!;

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

    const formattedIdentityDocuments = clientData.idDocumentDetails!;

    const amlBodies = getAmlBodiesAsString(acspDetails);

    res.render(config.CHECK_YOUR_ANSWERS, {
        ...getLocaleInfo(locales, lang),
        currentUrl,
        previousPage,
        matomoButtonClick: MATOMO_BUTTON_CLICK,
        clientData: {
            ...clientData,
            address: formattedAddress,
            dateOfBirth: formattedDateOfBirth,
            whenIdentityChecksCompleted: formattedwhenIdentityChecksCompleted,
            documentsChecked: formattedDocumentsChecked,
            idDocumentDetails: formattedIdentityDocuments
        },
        amlBodies,
        acspName: acspDetails.name
    });
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
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
        const formattedIdentityDocuments = clientData.idDocumentDetails!;

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
                idDocumentDetails: formattedIdentityDocuments
            },
            amlBodies,
            acspName: acspDetails.name
        });
    } else {
        try {
            const identityFromEmail = await findIdentityByEmail(clientData.emailAddress!);
            if (identityFromEmail !== undefined) {
                throw new Error("Email address already exists");
            } else {
                const identityVerificationService = new IdentityVerificationService();
                const verifiedClientData = identityVerificationService.prepareVerifiedClientData(clientData, req);

                const verifiedIdentity = await sendVerifiedClientDetails(verifiedClientData);
                saveDataInSession(req, REFERENCE, verifiedIdentity?.id);
                res.redirect(addLangToUrl(BASE_URL + CONFIRMATION, lang));
            }
        } catch (error) {
            logger.error("Verification-Api error" + JSON.stringify(error));
            const errorService = new ErrorService();
            errorService.renderErrorPage(res, locales, lang, BASE_URL + CHECK_YOUR_ANSWERS);
        }
    }
};
