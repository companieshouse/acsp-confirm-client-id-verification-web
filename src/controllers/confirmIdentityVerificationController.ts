import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { selectLang, addLangToUrl, getLocalesService, getLocaleInfo } from "../utils/localise";
import { BASE_URL, CONFIRM_IDENTITY_VERIFICATION, CHECK_YOUR_ANSWERS, ID_DOCUMENT_DETAILS } from "../types/pageURL";
import { Session } from "@companieshouse/node-session-handler";
import { USER_DATA, ACSP_DETAILS, CHECK_YOUR_ANSWERS_FLAG } from "../utils/constants";
import { ClientData } from "../model/ClientData";
import { validationResult } from "express-validator";
import { formatValidationError, getPageProperties } from "../validations/validation";
import { getAcspFullProfile, getAmlBodiesAsString } from "../services/acspProfileService";
import { getLoggedInAcspNumber } from "../utils/session";
import { AcspFullProfile } from "private-api-sdk-node/dist/services/acsp-profile/types";
import logger from "../utils/logger";
import { ErrorService } from "../services/errorService";
import { saveDataInSession } from "../utils/sessionHelper";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const session: Session = req.session as any as Session;
    const clientData: ClientData = session.getExtraData(USER_DATA)!;
    const formattedDate = new Date(clientData.whenIdentityChecksCompleted!)
        .toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

    const payload = {
        declaration: clientData.confirmIdentityVerified
    };
    saveDataInSession(req, CHECK_YOUR_ANSWERS_FLAG, false);
    try {

        const acspDetails = await getAcspFullProfile(getLoggedInAcspNumber(req.session));
        session.setExtraData(ACSP_DETAILS, acspDetails);

        const amlBodies = getAmlBodiesAsString(acspDetails);

        res.render(config.CONFIRM_IDENTITY_VERIFICATION, {
            previousPage: addLangToUrl(BASE_URL + ID_DOCUMENT_DETAILS, lang),
            ...getLocaleInfo(locales, lang),
            currentUrl: BASE_URL + CONFIRM_IDENTITY_VERIFICATION,
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
        logger.error("acsp profile data api error" + JSON.stringify(error));
        const errorService = new ErrorService();
        errorService.renderErrorPage(res, locales, lang, BASE_URL + CONFIRM_IDENTITY_VERIFICATION);
    }

};

export const post = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const errorList = validationResult(req);
    const session: Session = req.session as any as Session;
    const clientData: ClientData = session.getExtraData(USER_DATA)!;
    const acspDetails: AcspFullProfile = session.getExtraData(ACSP_DETAILS)!;
    const formattedDate = new Date(clientData.whenIdentityChecksCompleted!)
        .toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

    if (!errorList.isEmpty()) {
        const pageProperties = getPageProperties(formatValidationError(errorList.array(), lang));
        const amlBodies = getAmlBodiesAsString(acspDetails);
        res.status(400).render(config.CONFIRM_IDENTITY_VERIFICATION, {
            previousPage: addLangToUrl(BASE_URL + ID_DOCUMENT_DETAILS, lang),
            ...getLocaleInfo(locales, lang),
            currentUrl: BASE_URL + CONFIRM_IDENTITY_VERIFICATION,
            firstName: clientData?.firstName,
            lastName: clientData?.lastName,
            formattedDate,
            ...pageProperties,
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
        res.redirect(addLangToUrl(BASE_URL + CHECK_YOUR_ANSWERS, lang));
    }
};
