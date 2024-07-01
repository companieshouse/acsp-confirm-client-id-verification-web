import { body } from "express-validator";

const addressDetailsFormat: RegExp = /^[A-Za-z0-9\-',\s]*$/;
const addressUKPostcodeFormat:RegExp = /^(([A-Z]{1,2}[0-9][A-Z0-9]?|ASCN|STHL|TDCU|BBND|[BFS]IQQ|PCRN|TKCA) ?[0-9][A-Z]{2}|BFPO ?[0-9]{1,4}|(KY[0-9]|MSR|VG|AI)[ -]?[0-9]{4}|[A-Z]{2} ?[0-9]{2}|GE ?CX|GIR ?0A{2}|SAN ?TA1)$/;
const addressPostcodevaild:RegExp = /^[A-Za-z0-9\s]*$/;

export const homeAddressValidator = [

    body("postCode").trim().notEmpty().withMessage("homeAddressEnterPostCode").toUpperCase().bail()
        .matches(addressPostcodevaild).withMessage("homeAddressInvalidPostcodeFormat").bail()
        .matches(addressUKPostcodeFormat).withMessage("homeAddressEnterFullPostcode").bail()
        .isLength({ min: 5, max: 50 }).withMessage("homeAddressEnterFullPostcode"),

    body("premise").trim().matches(addressDetailsFormat).withMessage("homeAddressInvalidPropertyDetails").bail()
];
