import { NextFunction, Request, Response } from "express";
import * as config from "../../config";
import { FormatService } from "../../services/formatService";
import { selectLang, addLangToUrl, getLocalesService, getLocaleInfo } from "../../utils/localise";
import { BASE_URL, CONFIRMATION_REDIRECT, REVERIFY_BASE_URL, REVERIFY_CHECK_YOUR_ANSWERS, REVERIFY_CONFIRMATION } from "../../types/pageURL";
import { Session } from "@companieshouse/node-session-handler";
import { ACSP_DETAILS, DATA_SUBMITTED_AND_EMAIL_SENT, REFERENCE, USER_DATA } from "../../utils/constants";
import { ClientData } from "../../model/ClientData";
import { AcspFullProfile } from "private-api-sdk-node/dist/services/acsp-profile/types";
import { getAmlBodiesAsString } from "../../services/acspProfileService";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const locales = getLocalesService();
        const lang = selectLang(req.query.lang);
        const session: Session = req.session as any as Session;

        const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};
        const acspDetails: AcspFullProfile = session.getExtraData(ACSP_DETAILS)!;

        const reference = session.getExtraData(REFERENCE);

        const formattedDateOfBirth = FormatService.formatDate(
            clientData.dateOfBirth ? new Date(clientData.dateOfBirth) : undefined
        );
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
        const formattedAddress = FormatService.formatAddress(clientData.address);
        const identityDocuments = clientData.idDocumentDetails!;

        session.deleteExtraData(DATA_SUBMITTED_AND_EMAIL_SENT);

        res.render(config.REVERIFY_CONFIRMATION, {
            previousPage: addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang),
            ...getLocaleInfo(locales, lang),
            currentUrl: REVERIFY_BASE_URL + REVERIFY_CONFIRMATION,
            reference,
            amlBodies,
            acspName: acspDetails.name,
            feedbackSurveyLink: "#",
            verifyServiceLink: addLangToUrl(BASE_URL + CONFIRMATION_REDIRECT + "?id=verify-service-link", lang),
            authorisedAgentLink: addLangToUrl(BASE_URL + CONFIRMATION_REDIRECT + "?id=authorised-agent-account-link", lang),
            serviceUrl: BASE_URL + CONFIRMATION_REDIRECT + "?id=service-url-link",
            clientData: {
                ...clientData,
                address: formattedAddress,
                dateOfBirth: formattedDateOfBirth,
                whenIdentityChecksCompleted: formattedwhenIdentityChecksCompleted,
                documentsChecked: formattedDocumentsChecked,
                idDocumentDetails: identityDocuments
            }
        });
    } catch (error) {
        next(error);
    }
};
