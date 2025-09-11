import { NextFunction, Request, Response } from "express";
import * as config from "../../config";
import { selectLang, addLangToUrl, getLocalesService, getLocaleInfo } from "../../utils/localise";
import { REVERIFY_BASE_URL, REVERIFY_CONFIRM_IDENTITY_REVERIFICATION, REVERIFY_ENTER_ID_DOCUMENT_DETAILS, REVERIFY_CHECK_YOUR_ANSWERS } from "../../types/pageURL";
import { Session } from "@companieshouse/node-session-handler";
import { USER_DATA, ACSP_DETAILS, CHECK_YOUR_ANSWERS_FLAG } from "../../utils/constants";
import { ClientData } from "../../model/ClientData";
import { validationResult } from "express-validator";
import { formatValidationError, getPageProperties } from "../../validations/validation";
import { getAmlBodiesAsString } from "../../services/acspProfileService";
import { AcspFullProfile } from "private-api-sdk-node/dist/services/acsp-profile/types";
import { saveDataInSession } from "../../utils/sessionHelper";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const session: Session = req.session as any as Session;
        const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};
        const formattedDate = clientData?.whenIdentityChecksCompleted ? new Date(clientData.whenIdentityChecksCompleted)
            .toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";

        const payload = {
            declaration: clientData.confirmIdentityVerified
        };
        saveDataInSession(req, CHECK_YOUR_ANSWERS_FLAG, false);
        const acspDetails: AcspFullProfile = session.getExtraData(ACSP_DETAILS)!;
        const amlBodies = getAmlBodiesAsString(acspDetails);

        res.render(config.CONFIRM_IDENTITY_VERIFICATION, {
            previousPage: addLangToUrl(REVERIFY_BASE_URL + REVERIFY_ENTER_ID_DOCUMENT_DETAILS, lang),
            ...getLocaleInfo(locales, lang),
            currentUrl: REVERIFY_BASE_URL + REVERIFY_CONFIRM_IDENTITY_REVERIFICATION,
            firstName: clientData?.firstName,
            lastName: clientData?.lastName,
            formattedDate,
            payload,
            acspName: acspDetails.name,
            amlBodies,
            preferredFirstName: clientData?.preferredFirstName,
            preferredLastName: clientData?.preferredLastName,
            useNameOnPublicRegister: clientData?.useNameOnPublicRegister
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
        const session: Session = req.session as any as Session;
        const clientData: ClientData = session.getExtraData(USER_DATA)!;
        const acspDetails: AcspFullProfile = session.getExtraData(ACSP_DETAILS)!;
        const formattedDate = clientData?.whenIdentityChecksCompleted ? new Date(clientData.whenIdentityChecksCompleted)
            .toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";

        if (!errorList.isEmpty()) {
            const pageProperties = getPageProperties(formatValidationError(errorList.array(), lang));
            const amlBodies = getAmlBodiesAsString(acspDetails);
            res.status(400).render(config.CONFIRM_IDENTITY_VERIFICATION, {
                previousPage: addLangToUrl(REVERIFY_BASE_URL + REVERIFY_ENTER_ID_DOCUMENT_DETAILS, lang),
                ...getLocaleInfo(locales, lang),
                ...pageProperties,
                currentUrl: REVERIFY_BASE_URL + REVERIFY_CONFIRM_IDENTITY_REVERIFICATION,
                firstName: clientData?.firstName,
                lastName: clientData?.lastName,
                formattedDate,
                amlBodies,
                acspName: acspDetails.name,
                preferredFirstName: clientData?.preferredFirstName,
                preferredLastName: clientData?.preferredLastName,
                useNameOnPublicRegister: clientData?.useNameOnPublicRegister
            });
        } else {
            if (clientData) {
                clientData.confirmIdentityVerified = req.body.declaration;
            }
            res.redirect(addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang));
        }
    } catch (error) {
        next(error);
    }
};
