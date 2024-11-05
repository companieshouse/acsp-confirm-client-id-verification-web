import { body } from "express-validator";
import countryList from "../lib/countryList";

export const whereDoYouLiveValidator = [
    body("countryInput", "whereDoYouLiveNoData").trim().notEmpty().bail().isIn(countryList.split(";"))
];
