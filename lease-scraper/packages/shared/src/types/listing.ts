export interface RawListing {
  id?: string;
  sourceListingId?: string;
  url?: string;
  canonicalUrl?: string;
  title?: string;
  headline?: string;
  name?: string;

  // Address
  address?: string;
  street?: string;
  unit?: string;
  city?: string;
  state?: string;
  zip?: string;
  zipCode?: string;
  postalCode?: string;

  // Location
  lat?: number;
  latitude?: number;
  lng?: number;
  lon?: number;
  longitude?: number;

  // Price
  price?: number | string;
  priceMin?: number;
  priceMax?: number;
  rent?: number | string;

  // Details
  beds?: number | string;
  bedrooms?: number | string;
  baths?: number | string;
  bathrooms?: number | string;
  sqft?: number | string;
  squareFeet?: number | string;
  square_feet?: number | string;

  // Classification
  propertyType?: string;
  property_type?: string;
  type?: string;

  // Availability
  availabilityDate?: string;
  available?: string;
  availableDate?: string;
  moveInDate?: string;

  // Lease
  leaseTerm?: string;
  lease_term?: string;
  deposit?: number | string;
  securityDeposit?: number | string;
  fees?: Record<string, unknown> | unknown[];

  // Amenities
  amenities?: string[] | string;

  // Description
  description?: string;
  details?: string;

  // Contact
  phone?: string;
  email?: string;
  agentName?: string;
  contact?: {
    phone?: string;
    email?: string;
    name?: string;
  };

  // Images
  images?: string[] | Array<{ url: string; [key: string]: unknown }>;
  photos?: string[] | Array<{ url: string; [key: string]: unknown }>;

  // Catch-all
  [key: string]: unknown;
}

export interface NormalizedListing {
  sourceListingId: string | null;
  canonicalUrl: string;
  title: string | null;
  street: string | null;
  unit: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  lat: number | null;
  lng: number | null;
  priceMin: number | null;
  priceMax: number | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  propertyType: string | null;
  availabilityDate: Date | null;
  leaseTerm: string | null;
  deposit: number | null;
  feesJson: unknown | null;
  amenitiesJson: string[] | null;
  description: string | null;
  contactJson: { phone?: string; email?: string; name?: string } | null;
  imageUrls: string[];
  rawJson: unknown;
}

export interface DiscoveredEndpoint {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: unknown;
  paginationType: 'page' | 'offset' | 'cursor' | 'bounds' | 'none';
  listingsPath: string;
  sampleCount: number;
  discoveredAt: string;
}

export interface DiscoveryConfig {
  source: string;
  targetUrl: string;
  endpoints: DiscoveredEndpoint[];
}

export interface IngestRunResult {
  runId: string;
  status: 'completed' | 'failed' | 'partial';
  listingsUpserted: number;
  listingsSkipped: number;
  imagesDownloaded: number;
  errors: Array<{ message: string; listingId?: string; url?: string }>;
  durationMs: number;
}
