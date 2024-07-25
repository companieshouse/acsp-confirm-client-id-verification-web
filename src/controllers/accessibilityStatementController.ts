import { NextFunction, Request, Response } from "express";
import * as config from "../config";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    res.render(config.ACCESSIBILITY_STATEMENT);
};
