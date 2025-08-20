import { Request } from "express";
import { getSessionRequestWithPermission } from "../../mocks/session.mock";
import { PersonsNameService } from "../../../src/services/personsNameService";
import { USER_DATA } from "../../../src/utils/constants";
import { ClientData } from "../../../src/model/ClientData";

describe("PersonsNameService tests", () => {
    let req: Request;
    beforeEach(() => {
        const session = getSessionRequestWithPermission();
        req = {
            body: {
                "first-name": "John",
                "middle-names": "James",
                "last-name": "Smith"
            },
            session: session
        } as any as Request;
    });

    describe("savePersonsNameData", () => {
        it("should save person name data to existing session data", () => {
            PersonsNameService.savePersonsNameData(req);

            const clientData = req.session!.getExtraData(USER_DATA) as ClientData;
            expect(clientData.firstName).toBe("John");
            expect(clientData.middleName).toBe("James");
            expect(clientData.lastName).toBe("Smith");
        });

        it("should create and save person name data when session data is undefined", () => {
            const session = req.session as any;
            session.setExtraData(USER_DATA, undefined);

            PersonsNameService.savePersonsNameData(req);

            const clientData = session.getExtraData(USER_DATA) as ClientData;
            expect(clientData.firstName).toBe("John");
            expect(clientData.middleName).toBe("James");
            expect(clientData.lastName).toBe("Smith");
        });
    });
});
