import { Request } from "express";

export const mockRequest = () => {
    const req = {
        originalUrl: "",
        headers: {
            referer: undefined
        }
    } as Request;
    req.params = {
        id: "1"
    };
    return req;
};