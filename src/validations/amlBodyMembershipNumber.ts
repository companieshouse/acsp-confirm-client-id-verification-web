import { body, ValidationChain } from "express-validator";

const documentDetailsValidator = (): ValidationChain[] => {
    const documentDetailsValidatorErrors: ValidationChain[] = [];
    const numberOfDocumentDetails = 33;
    for (let i = 1; i <= numberOfDocumentDetails; i++) {
        documentDetailsValidatorErrors.push(
            body(`documentDetails_${i}`)
                .trim()
                .notEmpty()
                .withMessage("Enter the details for the document reference") // Custom error for empty input
                .bail()
                .isLength({ max: 50 })
                .withMessage("The document reference must be exactly 9 characters long") // Error for incorrect length
                .bail()
                .isAlphanumeric()
                .withMessage("The document reference must only include letters and numbers") // Error for non-alphanumeric input
        );
    }
    return documentDetailsValidatorErrors;
};

export default documentDetailsValidator;
