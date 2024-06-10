import { Request, Response } from "express";
import { GenericHandler } from "./../generic";
import logger from "../../../lib/Logger";

export class ProfileHandler extends GenericHandler {

    constructor () {
        super();
        this.viewData.title = "Profile handler for user router";
        this.viewData.sampleKey = "sample value for user profile screen";
    }

    async execute (req: Request, response: Response, method?: string): Promise<Object> {
        logger.info(`GET request for to get user profile`);
        // ...process request here and return data for the view
        return this.viewData;
    }

    // additional support method in handler
    private supportMethod1 (): Object {
        return {};
    }

    // additional support method in handler
    private supportMethod2 (): boolean {
        return true;
    }
};
