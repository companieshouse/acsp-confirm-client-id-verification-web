import { Request, Response } from "express";
import { GenericHandler } from "./../generic";
import { CompanyFormsValidator } from "./../../../lib/validation/formValidators/company";
import logger from "../../../lib/Logger";

export class DetailsHandler extends GenericHandler {
    constructor () {
        super();
        this.viewData.title = "Details handler for company router";
        this.viewData.sampleKey = "sample value for company details screen";
    }

    execute (req: Request, response: Response): Promise<Object> {
        logger.info(`GET request for to get company details, with id: ${req.params.id}`);
        // ...process request here and return data for the view
        return Promise.resolve(this.viewData);
    }

    // additional support method in handler
    private supportMethod1 (): boolean {
        return true;
    }

    // additional support method in handler
    private supportMethod2 (): boolean {
        return false;
    }
};
