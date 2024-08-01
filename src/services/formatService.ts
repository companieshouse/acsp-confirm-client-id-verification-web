import { Address } from "../model/Address";

export class FormatService {
  public static formatAddress(address?: Address): string {
    if (!address) {
      return '';
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
    return addressParts.filter(Boolean).join('\n');
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

  public static formatBulletList(items?: string[]): string {
    if (!items || items.length === 0) {
      return '';
    }
    return items.map(item => `• ${item}`).join('\n');
  }
}

