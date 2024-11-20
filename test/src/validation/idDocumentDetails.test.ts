import { ValidationChain } from "express-validator";
import idDocumentDetailsValidator from "../../../src/validations/idDocumentDetails";

describe("idDocumentDetailsValidator", () => {
    it("should return an array of ValidationChain objects", () => {
        const validationChains: ValidationChain[] = idDocumentDetailsValidator();
        expect(Array.isArray(validationChains)).toBeTruthy();
        validationChains.forEach((validationChain) => {
            expect(validationChain).toBeInstanceOf(Function);
        });
    });
});
