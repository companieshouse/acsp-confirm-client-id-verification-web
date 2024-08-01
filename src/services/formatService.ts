import { Address } from "../model/Address";
export class FormatService {
    public static formatAddress(address?: Address): string {
      if (!address) {
        return '';
      }
  
      let formattedAddress = address.propertyDetails +
      " " + address?.line1;
  
      if (address.line2) {
        formattedAddress += formattedAddress ? `<br>${address.line2}` : address.line2;
      }
  
      if (address.town) {
        formattedAddress += formattedAddress ? `<br>${address.town}` : address.town;
      }
  
      if (address.county) {
        formattedAddress += formattedAddress ? `<br>${address.county}` : address.county;
      }
  
      if (address.country) {
        formattedAddress += formattedAddress ? `<br>${address.country}` : address.country;
      }
  
      if (address.postcode) {
        formattedAddress += formattedAddress ? `<br>${address.postcode}` : address.postcode;
      }
  
      return formattedAddress;
    }

    public static formatDate(date?: Date): string {
    if (!date) {
      return '';
    }
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
    return new Intl.DateTimeFormat('en-GB', options).format(date);
  }

    public static formatDocumentsChecked(documents?: string[]): string {
        if (!documents || documents.length === 0) {
            return '';
        }

        // const documentMapping: { [key: string]: string } = {
        //     passportIrishCard: "Current signed passport",
        //     identityCard: "Photo driving licence",
        //     ukBRP: "UK Biometric Residence Permit",
        //     ukBRC: "UK Biometric Residence Card",
        //     birthCert: "Birth certificate",
        //     marriageCert: "Marriage certificate"
        // };

        return documents
            //.map(doc => documentMapping[doc] || doc)
            .join('<br>');
    }

    // public static formatHowIdentityDocsChecked(option: string | undefined, i18n: any): string {
    //     if (!option) {
    //         return '';
    //     }

    //     const optionsMapping: { [key: string]: string } = {
    //         "Option 1": `${i18n.howIdentityDocsCheckedOption1} - ${i18n.howIdentityDocsCheckedOption1hint}`,
    //         "Option 2": `${i18n.howIdentityDocsCheckedOption2} - ${i18n.howIdentityDocsCheckedOption2hint}`
    //     };

    //     return optionsMapping[option] || option;
    // }

}
