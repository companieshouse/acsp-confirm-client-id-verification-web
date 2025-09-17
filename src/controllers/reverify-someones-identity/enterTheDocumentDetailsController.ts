import { Session } from "@companieshouse/node-session-handler";
import { NextFunction, Request, Response } from "express";
import countryList from "../../lib/countryList";
import * as config from "../../config";
import {
    REVERIFY_BASE_URL,
    REVERIFY_ENTER_ID_DOCUMENT_DETAILS,
    REVERIFY_WHICH_IDENTITY_DOCS_CHECKED_GROUP1,
    REVERIFY_WHICH_IDENTITY_DOCS_CHECKED_GROUP2,
    REVERIFY_CHECK_YOUR_ANSWERS,
    REVERIFY_CONFIRM_IDENTITY_REVERIFICATION
} from "../../types/pageURL";
import { ClientData } from "../../model/ClientData";
import { CHECK_YOUR_ANSWERS_FLAG, CRYPTOGRAPHIC_SECURITY_FEATURES, USER_DATA } from "../../utils/constants";
import { formatValidationError, getPageProperties } from "../../validations/validation";
import { validationResult } from "express-validator";
import {
    addLangToUrl,
    getLocaleInfo,
    getLocalesService,
    selectLang
} from "../../utils/localise";
import { FormatService } from "../../services/formatService";
import { IdDocumentDetailsService } from "../../services/idDocumentDetailsService";
import { DocumentDetails } from "../../model/DocumentDetails";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let payload;
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const session: Session = req.session as any as Session;
        const clientData: ClientData = session?.getExtraData(USER_DATA)! || {};

        const formattedDocumentsChecked = FormatService.formatDocumentsCheckedText(clientData.documentsChecked,
            clientData.howIdentityDocsChecked,
            locales.i18nCh.resolveNamespacesKeys(lang)
        );
        const formattedHintText = FormatService.formatDocumentHintText(clientData.documentsChecked,
            clientData.howIdentityDocsChecked,
            locales.i18nCh.resolveNamespacesKeys(lang));

        if (clientData.idDocumentDetails != null) {
            payload = createPayloadForReverification(clientData.idDocumentDetails,
                formattedDocumentsChecked,
                locales.i18nCh.resolveNamespacesKeys(lang));
        }

        res.render(config.ID_DOCUMENT_DETAILS, {
            ...getLocaleInfo(locales, lang),
            previousPage: addLangToUrl(getReverifyBackUrl(clientData.howIdentityDocsChecked!), lang),
            documentsChecked: formattedDocumentsChecked,
            currentUrl: REVERIFY_BASE_URL + REVERIFY_ENTER_ID_DOCUMENT_DETAILS,
            countryList: countryList,
            hintText: formattedHintText,
            payload
        });
    } catch (error) {
        next(error);
    }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errorList = validationResult(req);
        const session: Session = req.session as any as Session;
        const locales = getLocalesService();
        const lang = selectLang(req.query.lang);
        const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};

        const formattedHintText = FormatService.formatDocumentHintText(clientData.documentsChecked,
            clientData.howIdentityDocsChecked,
            locales.i18nCh.resolveNamespacesKeys(lang));

        const formattedDocumentsChecked = FormatService.formatDocumentsCheckedText(clientData.documentsChecked,
            clientData.howIdentityDocsChecked,
            locales.i18nCh.resolveNamespacesKeys(lang)
        );

        const documentDetailsService = new IdDocumentDetailsService();
        const typeOfTheDocumentCheck = clientData.howIdentityDocsChecked!;
        const whenIdentityChecksCompleted = new Date(clientData.whenIdentityChecksCompleted!);
        const currentUrl: string = REVERIFY_BASE_URL + REVERIFY_ENTER_ID_DOCUMENT_DETAILS;
        const errorArray = documentDetailsService.errorListDisplay(
            errorList.array(),
            formattedDocumentsChecked,
            lang,
            whenIdentityChecksCompleted,
            typeOfTheDocumentCheck);

        if (errorArray.length) {
            const pageProperties = getPageProperties(formatValidationError(errorArray, lang));
            res.status(400).render(config.ID_DOCUMENT_DETAILS, {
                previousPage: addLangToUrl(getReverifyBackUrl(clientData.howIdentityDocsChecked!), lang),
                ...getLocaleInfo(locales, lang),
                pageProperties: pageProperties,
                payload: req.body,
                currentUrl,
                documentsChecked: formattedDocumentsChecked,
                hintText: formattedHintText,
                countryList: countryList
            });
        } else {
            documentDetailsService.saveIdDocumentDetails(req, clientData, clientData.documentsChecked!);
            const reverificationCheckYourAnswersFlag = session?.getExtraData(CHECK_YOUR_ANSWERS_FLAG);
            if (reverificationCheckYourAnswersFlag) {
                res.redirect(addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CHECK_YOUR_ANSWERS, lang));
            } else {
                res.redirect(addLangToUrl(REVERIFY_BASE_URL + REVERIFY_CONFIRM_IDENTITY_REVERIFICATION, lang));
            }
        }
    } catch (error) {
        next(error);
    }
};

export const createPayloadForReverification = (idDocumentDetails: DocumentDetails[], formatDocumentsCheckedText: string[], i18n: any): { [key: string]: string | undefined } => {
    const payload: { [key: string]: any } = {};
    idDocumentDetails.forEach((body) => {
        for (let i = 0; i < formatDocumentsCheckedText.length; i++) {
            if (formatDocumentsCheckedText[i] === i18n[body.docName]) {
                payload[`documentNumber_${i + 1}`] = body.documentNumber;
                if (!body.expiryDate) {
                    payload[`expiryDateDay_${i + 1}`] = undefined;
                    payload[`expiryDateMonth_${i + 1}`] = undefined;
                    payload[`expiryDateYear_${i + 1}`] = undefined;
                } else {
                    payload[`expiryDateDay_${i + 1}`] = body.expiryDate.getDate();
                    payload[`expiryDateMonth_${i + 1}`] = body.expiryDate.getMonth() + 1;
                    payload[`expiryDateYear_${i + 1}`] = body.expiryDate.getFullYear();
                }
                payload[`countryInput_${i + 1}`] = body.countryOfIssue;
            }
        }
    });
    return payload;
};

const getReverifyBackUrl = (selectedOption: string) => {
    return selectedOption !== CRYPTOGRAPHIC_SECURITY_FEATURES
        ? REVERIFY_BASE_URL + REVERIFY_WHICH_IDENTITY_DOCS_CHECKED_GROUP2
        : REVERIFY_BASE_URL + REVERIFY_WHICH_IDENTITY_DOCS_CHECKED_GROUP1;
};
