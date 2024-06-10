import { Request, Response } from "express";
import logger from "./../../../lib/Logger";
import { GenericHandler } from "./../generic";
import { CompanyFormsValidator } from "./../../../lib/validation/formValidators/company";

export class CreateHandler extends GenericHandler {

    validator: CompanyFormsValidator;

    constructor () {
        super();
        this.validator = new CompanyFormsValidator();
        this.viewData.title = "Create handler for company router";
        this.viewData.sampleKey = "sample value for create a company screen";
    }

    // process request here and return data for the view
    public async execute (req: Request, response: Response, method: string = "GET"): Promise<any> {
        logger.info(`${method} request to create a company`);
        try {
            if (method !== "POST") {
                return this.viewData;
            }
            this.viewData.payload = req.body;
            await this.validator.validateCreateCompany(req.body);
            await this.save(req.body);
            this.viewData.dataSaved = true;
        } catch (err: any) {
            logger.error(`error creating a company: ${err}`);
            this.viewData.errors = this.processHandlerException(err);
        }
        return this.viewData;
    }

    // call service(s) to save data here
    private save (payload: any): Object {
        return Promise.resolve(true);
    }

    // additional support method in handler
    private supportMethod2 (): Object {
        return Promise.resolve(true);
    }
};
