import { body } from "express-validator";

export const addressListValidator = (serviceName?: string) => [
    body("homeAddress")
        .notEmpty()
        .withMessage(() => {
            if (serviceName === "reverify") {
                return "reverifyChooseAddressNoRadioBtnSelected";
            } else {
                return "addressListNoRadioBtnSelected";
            }
        })
];
