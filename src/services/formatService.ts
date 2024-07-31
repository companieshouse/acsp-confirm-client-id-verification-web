import { Address } from "../model/Address";
  export class FormatService {
    public static formatAddress(address?: Address): string {
        
      if (!address) {
        return '';
      }
      return [
        address.propertyDetails,
        address.line1 += "<br>" +
        address.line2,
        address.town,
        address.county,
        address.country,
        address.postcode
      ]
      .filter(Boolean) 
      .join('\n');
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
}
