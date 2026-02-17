import { z } from 'zod';

export const ListingQuerySchema = z.object({
  city: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  beds: z.coerce.number().int().optional(),
  baths: z.coerce.number().optional(),
  bounds: z
    .string()
    .regex(/^-?\d+\.?\d*,-?\d+\.?\d*,-?\d+\.?\d*,-?\d+\.?\d*$/)
    .optional(),
  availabilityBefore: z.coerce.date().optional(),
  availabilityAfter: z.coerce.date().optional(),
  q: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListingQuery = z.infer<typeof ListingQuerySchema>;

export const NormalizedListingSchema = z.object({
  sourceListingId: z.string().nullable(),
  canonicalUrl: z.string().url(),
  title: z.string().nullable(),
  street: z.string().nullable(),
  unit: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  zip: z.string().nullable(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  priceMin: z.number().nullable(),
  priceMax: z.number().nullable(),
  beds: z.number().int().nullable(),
  baths: z.number().nullable(),
  sqft: z.number().int().nullable(),
  propertyType: z.string().nullable(),
  availabilityDate: z.date().nullable(),
  leaseTerm: z.string().nullable(),
  deposit: z.number().nullable(),
  feesJson: z.unknown().nullable(),
  amenitiesJson: z.array(z.string()).nullable(),
  description: z.string().nullable(),
  contactJson: z
    .object({
      phone: z.string().optional(),
      email: z.string().optional(),
      name: z.string().optional(),
    })
    .nullable(),
  imageUrls: z.array(z.string()),
  rawJson: z.unknown(),
});

export const IngestRunQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
