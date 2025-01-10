import { Response } from "express";

export const mockResponse = () => {
    const res = {} as Response;
    res.redirect = jest.fn().mockReturnValue(res);
    res.status = jest.fn().mockReturnValue(res);
    res.render = jest.fn().mockReturnValue(res);
    return res as unknown as Response;
};