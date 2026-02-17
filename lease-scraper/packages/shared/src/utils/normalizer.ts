import type { RawListing, NormalizedListing } from '../types/listing';
import { canonicalizeUrl } from './url';

function toNumberOrNull(val: unknown): number | null {
  if (val === null || val === undefined || val === '') return null;
  const n = typeof val === 'string' ? parseFloat(val.replace(/[^0-9.\-]/g, '')) : Number(val);
  return isNaN(n) ? null : n;
}

function toIntOrNull(val: unknown): number | null {
  const n = toNumberOrNull(val);
  return n !== null ? Math.round(n) : null;
}

function toDateOrNull(val: unknown): Date | null {
  if (!val) return null;
  const d = new Date(val as string);
  return isNaN(d.getTime()) ? null : d;
}

function parsePrice(raw: RawListing): { min: number | null; max: number | null } {
  if (raw.priceMin != null || raw.priceMax != null) {
    return { min: toNumberOrNull(raw.priceMin), max: toNumberOrNull(raw.priceMax) };
  }

  const priceStr = String(raw.price ?? raw.rent ?? '');
  if (!priceStr) return { min: null, max: null };

  // Handle range like "$1,200 - $1,500"
  const rangeMatch = priceStr.match(
    /\$?([\d,]+(?:\.\d+)?)\s*[-–]\s*\$?([\d,]+(?:\.\d+)?)/
  );
  if (rangeMatch) {
    return {
      min: parseFloat(rangeMatch[1].replace(/,/g, '')),
      max: parseFloat(rangeMatch[2].replace(/,/g, '')),
    };
  }

  const singleVal = toNumberOrNull(priceStr);
  return { min: singleVal, max: singleVal };
}

function parseAddress(raw: RawListing): {
  street: string | null;
  unit: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
} {
  if (raw.street || raw.city) {
    return {
      street: raw.street || null,
      unit: raw.unit || null,
      city: raw.city || null,
      state: raw.state || null,
      zip: raw.zip || raw.zipCode || raw.postalCode || null,
    };
  }

  if (raw.address && typeof raw.address === 'string') {
    // Try to parse "123 Main St, Apt 2, Ann Arbor, MI 48103"
    const parts = raw.address.split(',').map((s) => s.trim());
    if (parts.length >= 3) {
      const stateZipMatch = parts[parts.length - 1].match(/([A-Z]{2})\s+(\d{5}(?:-\d{4})?)/);
      if (stateZipMatch) {
        return {
          street: parts[0],
          unit: parts.length > 3 ? parts[1] : null,
          city: parts[parts.length - 2],
          state: stateZipMatch[1],
          zip: stateZipMatch[2],
        };
      }
      return {
        street: parts[0],
        unit: parts.length > 3 ? parts[1] : null,
        city: parts[parts.length - 2],
        state: parts[parts.length - 1],
        zip: null,
      };
    }
    return { street: raw.address, unit: null, city: null, state: null, zip: null };
  }

  return { street: null, unit: null, city: null, state: null, zip: null };
}

function parseImages(raw: RawListing): string[] {
  const imgs = raw.images || raw.photos || [];
  if (!Array.isArray(imgs)) return [];
  return imgs
    .map((img) => {
      if (typeof img === 'string') return img;
      if (img && typeof img === 'object' && 'url' in img) return (img as { url: string }).url;
      return null;
    })
    .filter((url): url is string => typeof url === 'string' && url.length > 0);
}

function parseAmenities(raw: RawListing): string[] | null {
  if (!raw.amenities) return null;
  if (Array.isArray(raw.amenities)) return raw.amenities.map(String);
  if (typeof raw.amenities === 'string') {
    return raw.amenities
      .split(/[,;|]/)
      .map((a) => a.trim())
      .filter(Boolean);
  }
  return null;
}

function parseContact(
  raw: RawListing
): { phone?: string; email?: string; name?: string } | null {
  const contact: { phone?: string; email?: string; name?: string } = {};
  if (raw.contact) {
    if (raw.contact.phone) contact.phone = raw.contact.phone;
    if (raw.contact.email) contact.email = raw.contact.email;
    if (raw.contact.name) contact.name = raw.contact.name;
  }
  if (raw.phone) contact.phone = raw.phone;
  if (raw.email) contact.email = raw.email;
  if (raw.agentName) contact.name = raw.agentName;

  return Object.keys(contact).length > 0 ? contact : null;
}

/**
 * Normalize a raw listing from any source into our canonical shape.
 */
export function normalizeListing(
  raw: RawListing,
  sourceBaseUrl: string
): NormalizedListing {
  const price = parsePrice(raw);
  const address = parseAddress(raw);

  let canonicalUrl = raw.canonicalUrl || raw.url || '';
  if (canonicalUrl && !canonicalUrl.startsWith('http')) {
    canonicalUrl = new URL(canonicalUrl, sourceBaseUrl).toString();
  }
  canonicalUrl = canonicalizeUrl(canonicalUrl);

  return {
    sourceListingId: raw.sourceListingId || raw.id?.toString() || null,
    canonicalUrl,
    title: raw.title || raw.headline || raw.name || null,
    ...address,
    lat: toNumberOrNull(raw.lat ?? raw.latitude) ,
    lng: toNumberOrNull(raw.lng ?? raw.lon ?? raw.longitude),
    priceMin: price.min,
    priceMax: price.max,
    beds: toIntOrNull(raw.beds ?? raw.bedrooms),
    baths: toNumberOrNull(raw.baths ?? raw.bathrooms),
    sqft: toIntOrNull(raw.sqft ?? raw.squareFeet ?? raw.square_feet),
    propertyType: raw.propertyType || raw.property_type || raw.type || null,
    availabilityDate: toDateOrNull(raw.availabilityDate ?? raw.available ?? raw.availableDate ?? raw.moveInDate),
    leaseTerm: raw.leaseTerm || raw.lease_term || null,
    deposit: toNumberOrNull(raw.deposit ?? raw.securityDeposit),
    feesJson: raw.fees || null,
    amenitiesJson: parseAmenities(raw),
    description: raw.description || raw.details || null,
    contactJson: parseContact(raw),
    imageUrls: parseImages(raw),
    rawJson: raw,
  };
}
