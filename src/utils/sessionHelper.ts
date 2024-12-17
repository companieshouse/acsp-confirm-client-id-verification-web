import { Request } from "express";
import { Session } from "@companieshouse/node-session-handler";

export const saveDataInSession = async (req: Request, name: string, value: any) => {
    const session: Session = req.session as any as Session;
    session.setExtraData(name, value);
};
