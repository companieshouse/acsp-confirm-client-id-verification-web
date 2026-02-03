import { validationResult } from "express-validator";
import { confirmDateOfBirthEnteredCorrectlyValidator } from "../../../src/validations/confirmIdentityVerification";

describe("confirmDateOfBirthEnteredCorrectlyValidator", () => {
    const mockRequest = (body: any) => ({ body });
    const mockResponse = () => ({});
    const mockNext = jest.fn();

    it("should pass validation when confirmCorrectDateOfBirthEntered is provided", async () => {
        const req = mockRequest({ confirmCorrectDateOfBirthEntered: "true" });
        const res = mockResponse();

        for (const validator of confirmDateOfBirthEnteredCorrectlyValidator) {
            await validator(req, res, mockNext);
        }

        const errors = validationResult(req);
        expect(errors.isEmpty()).toBe(true);
    });

    it("should fail validation when confirmCorrectDateOfBirthEntered is missing", async () => {
        const req = mockRequest({});
        const res = mockResponse();

        for (const validator of confirmDateOfBirthEnteredCorrectlyValidator) {
            await validator(req, res, mockNext);
        }

        const errors = validationResult(req);
        expect(errors.isEmpty()).toBe(false);
        expect(errors.array()).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    msg: "notConfirmed",
                    param: "confirmCorrectDateOfBirthEntered"
                })
            ])
        );
    });

    it("should fail validation when confirmCorrectDateOfBirthEntered is empty", async () => {
        const req = mockRequest({ confirmCorrectDateOfBirthEntered: "" });
        const res = mockResponse();

        for (const validator of confirmDateOfBirthEnteredCorrectlyValidator) {
            await validator(req, res, mockNext);
        }

        const errors = validationResult(req);
        expect(errors.isEmpty()).toBe(false);
        expect(errors.array()).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    msg: "notConfirmed",
                    param: "confirmCorrectDateOfBirthEntered"
                })
            ])
        );
    });

    it("should fail validation when confirmCorrectDateOfBirthEntered is null", async () => {
        const req = mockRequest({ confirmCorrectDateOfBirthEntered: null });
        const res = mockResponse();

        for (const validator of confirmDateOfBirthEnteredCorrectlyValidator) {
            await validator(req, res, mockNext);
        }

        const errors = validationResult(req);
        expect(errors.isEmpty()).toBe(false);
        expect(errors.array()).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    msg: "notConfirmed",
                    param: "confirmCorrectDateOfBirthEntered"
                })
            ])
        );
    });
});
