import { Session } from "@companieshouse/node-session-handler";
import e, { NextFunction, Request, Response } from "express";
import countryList from "../lib/countryList";
import * as config from "../config";
import { BASE_URL, CONFIRM_IDENTITY_VERIFICATION, ID_DOCUMENT_DETAILS, PERSONS_NAME, WHICH_IDENTITY_DOCS_CHECKED_GROUP1, WHICH_IDENTITY_DOCS_CHECKED_GROUP2 } from "../types/pageURL";
import { ClientData } from "../model/ClientData";
import { MATOMO_LINK_CLICK, MATOMO_BUTTON_CLICK, USER_DATA } from "../utils/constants";
import { formatValidationError, getPageProperties, resolveErrorMessage } from "../validations/validation";
import { validationResult } from "express-validator";
import {
    addLangToUrl,
    getLocaleInfo,
    getLocalesService,
    selectLang
} from "../utils/localise";
import { FormatService } from "../services/formatService";
import { idDocumentDetailsService } from "../services/idDocumentDetailsService";
import { DocumentDetails } from "../model/DocumentDetails";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const session: Session = req.session as any as Session;
    const clientData: ClientData = session?.getExtraData(USER_DATA)!;
    console.log("client data in  a get----->", JSON.stringify(clientData))

    const formattedDocumentsChecked = FormatService.formatDocumentsCheckedText(
        clientData.documentsChecked,
        locales.i18nCh.resolveNamespacesKeys(lang)
    );

    // let payload;
    // if(clientData.idDocumentDetails != null){
    //     console.log("reached b------>")
    //     payload = createPayload(clientData.idDocumentDetails);
    // }

    res.render(config.ID_DOCUMENT_DETAILS, {
        previousPage: addLangToUrl(getBackUrl(clientData.howIdentityDocsChecked!), lang),
        ...getLocaleInfo(locales, lang),
        // matomoLinkClick: MATOMO_LINK_CLICK,
        // matomoButtonClick: MATOMO_BUTTON_CLICK,
        currentUrl: BASE_URL + ID_DOCUMENT_DETAILS,
        documentsChecked: formattedDocumentsChecked,
        countryList: countryList
        // payload
    });
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const session: Session = req.session as any as Session;
    const currentUrl: string = BASE_URL + ID_DOCUMENT_DETAILS;
    const clientData: ClientData = session.getExtraData(USER_DATA) ? session.getExtraData(USER_DATA)! : {};

    const formattedDocumentsChecked = FormatService.formatDocumentsCheckedText(
        clientData.documentsChecked,
        locales.i18nCh.resolveNamespacesKeys(lang)
    );

    const errorList = validationResult(req);
    console.log("error list------->", errorList);
    if (!errorList.isEmpty()) {
        const errorArray = errorListDisplay(errorList.array(), formattedDocumentsChecked!, lang, clientData.whenIdentityChecksCompleted!);
        console.log("before page prop------>", errorArray);
        const pageProperties = getPageProperties(formatValidationError(errorArray, lang));
        console.log("page prop------>", pageProperties)
        res.status(400).render(config.ID_DOCUMENT_DETAILS, {
            previousPage: addLangToUrl(getBackUrl(clientData.howIdentityDocsChecked!), lang),
            ...getLocaleInfo(locales, lang),
            pageProperties: pageProperties,
            payload: req.body,
            currentUrl,
            documentsChecked: formattedDocumentsChecked,
            countryList: countryList
        });
    } else {
        // const documentDetailsService = new idDocumentDetailsService();
        // documentDetailsService.saveIdDocumentDetails(req, clientData, locales, lang);
        // const clientData1: ClientData = session?.getExtraData(USER_DATA)!;
        // console.log("client data in post----->", JSON.stringify(clientData1))
        res.redirect(addLangToUrl(BASE_URL + CONFIRM_IDENTITY_VERIFICATION, lang));
    }
};

const errorListDisplay = (errors: any[], documentsChecked: string[], lang: string, whenIdDocsChecked: Date) => {
    const newErrorArray: any[] = [];

    errors.forEach((element) => {
      const errorText = element.msg;  
      element.msg = resolveErrorMessage(element.msg, lang);  

      if(element.param.includes("documentNumber_")){  
        const index = element.param.substr("documentNumber_".length) - 1;
        const selection = documentsChecked[index];
        if( element.value === "")  {            
            element.msg = element.msg + selection; 
        } else {
            element.msg = selection + element.msg;
        }    
      } else if (element.param.includes("expiryDate")){  
        let index: number;
        if (element.param.includes("expiryDateDay")){
           index = element.param.substr("expiryDateDay_".length) - 1;
        } else if (element.param.includes("expiryDateMonth")){
           index = element.param.substr("expiryDateMonth_".length) - 1;
        } else if (element.param.includes("expiryDateYear")){
           index = element.param.substr("expiryDateYear_".length) - 1;
        }

        const selection = documentsChecked[index!];
        if (selection === "UK accredited PASS card" || selection === "UK HM Armed Forces Veteran Card"){
           return;
        }
        if( errorText === "noExpiryDate"){
            element.msg = element.msg + selection
        } else if(errorText === "dateAfterIdChecksDone"){
            const part1 = resolveErrorMessage("dateAfterIdChecksDone1", lang);  
            const part2 = resolveErrorMessage("dateAfterIdChecksDone2", lang);  
            element.msg = part1 + whenIdDocsChecked + part2;
        } else {
            element.msg = "Expiry date for " + selection + element.msg // to do language
        }
      } else if (element.param.includes("countryInput")){
        const index = element.param.substr("countryInput_".length) - 1;
        const selection = documentsChecked[index];   
        console.log("selection---->", selection)     
        if(selection === undefined){
            return;
        }
        element.msg = element.msg + selection; 
      }
      newErrorArray.push(element);
    });
    console.log("new error array----->", newErrorArray)
    return newErrorArray
};

const getBackUrl = (selectedOption: string) => {
    if (selectedOption === "cryptographic_security_features_checked") {
        return BASE_URL + WHICH_IDENTITY_DOCS_CHECKED_GROUP1;
    } else {
        return BASE_URL + WHICH_IDENTITY_DOCS_CHECKED_GROUP2;
    }
};
// const createPayload = (idDocumentDetails: DocumentDetails[]): { [key: string]: string | undefined } => {
//     const payload: { [key: string]: any | undefined } = {};
//     idDocumentDetails.forEach((body, index) => {

//         payload[`documentNumber_${index + 1}`] = body.documentNumber;
//         payload[`expiryDateDay_${index + 1}`] = body.expiryDate!.getDay;
//         payload[`expiryDateMonth_${index + 1}`] = body.expiryDate!.getMonth;
//         payload[`expiryDateYear_${index + 1}`] = body.expiryDate!.getFullYear;
//         payload[`countryInput_${index + 1}`] = body.countryOfIssue;
//     });
//     console.log("payload---->", JSON.stringify(payload));
//     return payload;
// };
