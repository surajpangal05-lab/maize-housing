import type { NormalizedListing } from '../types/listing';
import { canonicalizeUrl } from './url';

const WIX_IMAGE_BASE = 'https://static.wixstatic.com/media/';

/**
 * Convert a Wix image URI like:
 *   wix:image://v1/73ddc6_abc123~mv2.jpeg/filename.jpeg#originWidth=4032&originHeight=3024
 * into a usable CDN URL:
 *   https://static.wixstatic.com/media/73ddc6_abc123~mv2.jpeg
 */
function wixImageToUrl(src: string): { url: string; width: number | null; height: number | null } | null {
  if (!src) return null;

  // Already a normal URL
  if (src.startsWith('http')) {
    return { url: src, width: null, height: null };
  }

  // Parse wix:image://v1/<slug>/<filename>#originWidth=W&originHeight=H
  const match = src.match(/^wix:image:\/\/v1\/([^/]+)/);
  if (!match) return null;

  const slug = match[1];
  const url = `${WIX_IMAGE_BASE}${slug}`;

  let width: number | null = null;
  let height: number | null = null;

  const widthMatch = src.match(/originWidth=(\d+)/);
  const heightMatch = src.match(/originHeight=(\d+)/);
  if (widthMatch) width = parseInt(widthMatch[1], 10);
  if (heightMatch) height = parseInt(heightMatch[1], 10);

  return { url, width, height };
}

function parseWixPrice(val: unknown): { min: number | null; max: number | null } {
  if (val === null || val === undefined) return { min: null, max: null };

  if (typeof val === 'number') return { min: val, max: val };

  const str = String(val).replace(/[$,]/g, '').trim();

  // Range: "1200 - 1500" or "1200-1500"
  const rangeMatch = str.match(/([\d.]+)\s*[-–]\s*([\d.]+)/);
  if (rangeMatch) {
    return {
      min: parseFloat(rangeMatch[1]),
      max: parseFloat(rangeMatch[2]),
    };
  }

  const num = parseFloat(str);
  if (!isNaN(num)) return { min: num, max: num };

  return { min: null, max: null };
}

function parseWixDate(val: unknown): Date | null {
  if (!val) return null;

  // Wix $date object: { "$date": "2024-03-12T00:08:29.033Z" }
  if (typeof val === 'object' && val !== null && '$date' in val) {
    const d = new Date((val as { $date: string }).$date);
    return isNaN(d.getTime()) ? null : d;
  }

  // Plain date string: "2026-08-15"
  if (typeof val === 'string') {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalize a raw Wix dynamic-pages item into our canonical listing shape.
 * Tuned specifically for the michiganrental.com Wix data format.
 */
export function normalizeWixListing(raw: Record<string, unknown>, sourceBaseUrl: string): NormalizedListing {
  // Address parsing from Wix nested propertyAddress
  const addr = raw.propertyAddress as {
    city?: string;
    subdivision?: string;
    postalCode?: string;
    formatted?: string;
    streetAddress?: {
      number?: string;
      name?: string;
      apt?: string;
      formattedAddressLine?: string;
    };
    location?: {
      latitude?: number;
      longitude?: number;
    };
  } | undefined;

  const streetLine = addr?.streetAddress?.formattedAddressLine
    || (addr?.streetAddress?.number && addr?.streetAddress?.name
      ? `${addr.streetAddress.number} ${addr.streetAddress.name}`
      : null);

  // Build canonical URL from the listing page link
  const detailPath = (raw['link-all-properties-listings-propertyName'] as string)
    || (raw['link-all-properties-listings-all'] as string)
    || '';
  const canonicalUrl = detailPath
    ? canonicalizeUrl(new URL(detailPath, sourceBaseUrl).toString())
    : canonicalizeUrl(`${sourceBaseUrl}/listing/${raw._id}`);

  // Parse images from the Wix image array
  const imageUrls: string[] = [];
  const rawImages = raw.image as Array<{
    src?: string;
    slug?: string;
    settings?: { width?: number; height?: number };
  }> | undefined;

  if (Array.isArray(rawImages)) {
    for (const img of rawImages) {
      const parsed = wixImageToUrl(img.src || '');
      if (parsed) {
        imageUrls.push(parsed.url);
      }
    }
  }

  // Also grab mainPropertyImage if images array is empty
  if (imageUrls.length === 0 && raw.mainPropertyImage) {
    const parsed = wixImageToUrl(raw.mainPropertyImage as string);
    if (parsed) {
      imageUrls.push(parsed.url);
    }
  }

  // Parse amenities
  let amenities: string[] | null = null;
  if (raw.amenities) {
    if (typeof raw.amenities === 'string') {
      amenities = raw.amenities
        .split(/[,;|]/)
        .map((a: string) => a.trim())
        .filter(Boolean);
    } else if (Array.isArray(raw.amenities)) {
      amenities = (raw.amenities as string[]).map(String);
    }
  }

  // Description - prefer marketingDescription, fall back to shortDescription
  const rawDesc = (raw.marketingDescription || raw.shortDescription || raw.shortDescriptionAlt || '') as string;
  const description = rawDesc.includes('<') ? stripHtml(rawDesc) : rawDesc;

  // Lease terms - strip HTML
  const rawLease = (raw.leaseTerms || '') as string;
  const leaseDetail = rawLease.includes('<') ? stripHtml(rawLease) : rawLease;
  const leaseTerm = (raw.leaseTerms1 as string) || leaseDetail || null;

  // Price
  const price = parseWixPrice(raw.marketRent);

  // Pet policy info to append to description
  const petPolicy = raw.petPolicy ? stripHtml(raw.petPolicy as string) : '';
  const fullDescription = [description, petPolicy].filter(Boolean).join('\n\n');

  // Fees (deposit)
  const deposit = parseWixPrice(raw.deposit);

  // Try to extract contact info from various possible fields
  const contact: { phone?: string; email?: string; name?: string } = {};
  
  // Check common Wix contact field patterns
  if (raw.phone || raw.phoneNumber || raw.contactPhone) {
    contact.phone = String(raw.phone || raw.phoneNumber || raw.contactPhone);
  }
  if (raw.email || raw.contactEmail || raw.agentEmail) {
    contact.email = String(raw.email || raw.contactEmail || raw.agentEmail);
  }
  if (raw.agentName || raw.contactName || raw.landlordName || raw.propertyManager) {
    contact.name = String(raw.agentName || raw.contactName || raw.landlordName || raw.propertyManager);
  }
  
  // Check nested contact object
  const rawContact = raw.contact as { phone?: string; email?: string; name?: string } | undefined;
  if (rawContact) {
    if (rawContact.phone && !contact.phone) contact.phone = rawContact.phone;
    if (rawContact.email && !contact.email) contact.email = rawContact.email;
    if (rawContact.name && !contact.name) contact.name = rawContact.name;
  }

  return {
    sourceListingId: (raw._id as string) || null,
    canonicalUrl,
    title: (raw.propertyName as string) || (raw.slug as string) || null,
    street: streetLine || null,
    unit: (raw.unit as string) || addr?.streetAddress?.apt || null,
    city: addr?.city || null,
    state: addr?.subdivision || null,
    zip: addr?.postalCode?.split('-')[0] || null,
    lat: addr?.location?.latitude || null,
    lng: addr?.location?.longitude || null,
    priceMin: price.min,
    priceMax: price.max,
    beds: typeof raw.bedrooms === 'number' ? raw.bedrooms : null,
    baths: typeof raw.bathrooms === 'number' ? raw.bathrooms : null,
    sqft: null, // not present in this data source
    propertyType: (raw.propertyType as string) || null,
    availabilityDate: parseWixDate(raw.availableDate),
    leaseTerm,
    deposit: deposit.min,
    feesJson: null,
    amenitiesJson: amenities,
    description: fullDescription || null,
    contactJson: Object.keys(contact).length > 0 ? contact : null,
    imageUrls,
    rawJson: raw,
  };
}
