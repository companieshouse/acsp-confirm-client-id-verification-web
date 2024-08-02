import { Address } from "../model/Address";

export class FormatService {
    public static formatAddress (address?: Address): string {
        if (!address) {
            return "";
        }

        const { propertyDetails, line1, line2, town, county, country, postcode } = address;

        // Create address parts array, joining line1 and line2 with a break tag
        const addressParts = [
            propertyDetails,
            `${line1}<br>${line2}`,
            town,
            county,
            country,
            postcode
        ];

        // Filter out any undefined or empty values and join with a newline character
        return addressParts.filter(Boolean).join("\n");
    }

    public static formatDate (date?: Date): string {
        if (!date) {
            return "";
        }
        if (!(date instanceof Date) || isNaN(date.getTime())) {
            throw new Error("Invalid date");
        }

        const options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "long", year: "numeric" };
        return new Intl.DateTimeFormat("en-GB", options).format(date);
    }

    public static formatBulletList (items?: string[]): string {
        if (!items || items.length === 0) {
            return "";
        }
        return items.map(item => `• ${item}`).join("\n");
    }

    public static formatIdentityDocChecked (option?: string): string {
        switch (option) {
        case "OPTION1":
            return "Hello";
        case "OPTION2":
            return "Hi";
        default:
            console.log("WHAAAAAAAAAAAAAAAAAAT IIIIIIISSSSSSSS ITTTTT");
            return option || "";

        }
    }

    /* public static formatHowIdentityDocsChecked(option: string | undefined, i18n: any): string {
            if (!option) {
                return '';
            }
            switch (option) {
                case "Option 1":
                    return `${i18n.howIdentityDocsCheckedOption1} - ${i18n.howIdentityDocsCheckedOption1hint}`;
                case "Option 2":
                    return `${i18n.howIdentityDocsCheckedOption2} - ${i18n.howIdentityDocsCheckedOption2hint}`;
                default:
                    return option;
            }
        } */
}
