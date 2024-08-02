import { Request } from "express";
import logger from "../utils/logger";

export function getPreviousPageUrl (req: Request, basePath: string) {
    const headers = req.rawHeaders;
    const absolutePreviousPageUrl = headers.filter(item => item.includes(basePath))[0];
    // Don't attempt to determine a relative previous page URL if no absolute URL is found
    if (!absolutePreviousPageUrl) {
        return absolutePreviousPageUrl;
    }

    const startingIndexOfRelativePath = absolutePreviousPageUrl.indexOf(basePath);
    const relativePreviousPageUrl = absolutePreviousPageUrl.substring(startingIndexOfRelativePath);

    logger.debugRequest(req, `Relative previous page URL is ${relativePreviousPageUrl}`);

    return relativePreviousPageUrl;

}
