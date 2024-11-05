import { body, ValidationChain } from "express-validator";

const idDocumentDetailsValidator = (): ValidationChain[] => {
    const documentDetailsValidatorErrors: ValidationChain[] = [];
    const numberOfDocumentDetails = 16;
    for (let i = 1; i <= numberOfDocumentDetails; i++) {
        documentDetailsValidatorErrors.push(
            (
                body(`documentDetails_${i}`)
                    .if(body(`documentDetails_${i}`).exists()).trim().notEmpty().withMessage("Enter the details for the document reference")
                    .bail().isLength({ max: 256 }).withMessage("The document reference must be exactly 9 characters long")
                    .bail().isAlphanumeric().withMessage("The document reference must only include letters and numbers") // Error for non-alphanumeric input
            ));
    }
    return documentDetailsValidatorErrors;
};

export default idDocumentDetailsValidator;
