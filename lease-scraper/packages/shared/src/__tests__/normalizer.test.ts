import { describe, it, expect } from 'vitest';
import { normalizeListing } from '../utils/normalizer';
import type { RawListing } from '../types/listing';

const BASE_URL = 'https://www.michiganrental.com';

describe('normalizeListing', () => {
  it('normalizes a simple listing', () => {
    const raw: RawListing = {
      id: '12345',
      url: '/listing/12345',
      title: 'Cozy 2BR in Ann Arbor',
      street: '123 Main St',
      city: 'Ann Arbor',
      state: 'MI',
      zip: '48103',
      lat: 42.2808,
      lng: -83.7430,
      price: 1200,
      beds: 2,
      baths: 1,
      sqft: 900,
      propertyType: 'apartment',
      description: 'A lovely apartment near downtown.',
      images: ['https://cdn.example.com/photo1.jpg', 'https://cdn.example.com/photo2.jpg'],
    };

    const result = normalizeListing(raw, BASE_URL);

    expect(result.sourceListingId).toBe('12345');
    expect(result.canonicalUrl).toBe('https://www.michiganrental.com/listing/12345');
    expect(result.title).toBe('Cozy 2BR in Ann Arbor');
    expect(result.street).toBe('123 Main St');
    expect(result.city).toBe('Ann Arbor');
    expect(result.state).toBe('MI');
    expect(result.zip).toBe('48103');
    expect(result.lat).toBeCloseTo(42.2808);
    expect(result.lng).toBeCloseTo(-83.743);
    expect(result.priceMin).toBe(1200);
    expect(result.priceMax).toBe(1200);
    expect(result.beds).toBe(2);
    expect(result.baths).toBe(1);
    expect(result.sqft).toBe(900);
    expect(result.propertyType).toBe('apartment');
    expect(result.description).toBe('A lovely apartment near downtown.');
    expect(result.imageUrls).toHaveLength(2);
  });

  it('parses price ranges', () => {
    const raw: RawListing = {
      url: 'https://example.com/listing',
      price: '$1,200 - $1,500',
    };

    const result = normalizeListing(raw, BASE_URL);
    expect(result.priceMin).toBe(1200);
    expect(result.priceMax).toBe(1500);
  });

  it('parses address from combined string', () => {
    const raw: RawListing = {
      url: 'https://example.com/listing',
      address: '123 Main St, Ann Arbor, MI 48103',
    };

    const result = normalizeListing(raw, BASE_URL);
    expect(result.street).toBe('123 Main St');
    expect(result.city).toBe('Ann Arbor');
    expect(result.state).toBe('MI');
    expect(result.zip).toBe('48103');
  });

  it('parses address with unit', () => {
    const raw: RawListing = {
      url: 'https://example.com/listing',
      address: '123 Main St, Apt 2B, Ann Arbor, MI 48103',
    };

    const result = normalizeListing(raw, BASE_URL);
    expect(result.street).toBe('123 Main St');
    expect(result.unit).toBe('Apt 2B');
    expect(result.city).toBe('Ann Arbor');
    expect(result.state).toBe('MI');
    expect(result.zip).toBe('48103');
  });

  it('handles alternate field names', () => {
    const raw: RawListing = {
      url: 'https://example.com/listing',
      headline: 'Nice Place',
      latitude: 42.0,
      longitude: -83.0,
      bedrooms: '3',
      bathrooms: '2.5',
      squareFeet: '1200',
      rent: '$1,100',
      property_type: 'house',
      lease_term: '12 months',
      securityDeposit: 1100,
    };

    const result = normalizeListing(raw, BASE_URL);
    expect(result.title).toBe('Nice Place');
    expect(result.lat).toBe(42.0);
    expect(result.lng).toBe(-83.0);
    expect(result.beds).toBe(3);
    expect(result.baths).toBe(2.5);
    expect(result.sqft).toBe(1200);
    expect(result.priceMin).toBe(1100);
    expect(result.propertyType).toBe('house');
    expect(result.leaseTerm).toBe('12 months');
    expect(result.deposit).toBe(1100);
  });

  it('extracts image URLs from objects', () => {
    const raw: RawListing = {
      url: 'https://example.com/listing',
      images: [
        { url: 'https://cdn.example.com/a.jpg', width: 800 },
        { url: 'https://cdn.example.com/b.png', width: 600 },
      ],
    };

    const result = normalizeListing(raw, BASE_URL);
    expect(result.imageUrls).toEqual([
      'https://cdn.example.com/a.jpg',
      'https://cdn.example.com/b.png',
    ]);
  });

  it('parses contact from nested object', () => {
    const raw: RawListing = {
      url: 'https://example.com/listing',
      contact: { phone: '555-1234', email: 'test@example.com', name: 'John Doe' },
    };

    const result = normalizeListing(raw, BASE_URL);
    expect(result.contactJson).toEqual({
      phone: '555-1234',
      email: 'test@example.com',
      name: 'John Doe',
    });
  });

  it('parses contact from flat fields', () => {
    const raw: RawListing = {
      url: 'https://example.com/listing',
      phone: '555-9999',
      email: 'agent@example.com',
      agentName: 'Jane',
    };

    const result = normalizeListing(raw, BASE_URL);
    expect(result.contactJson).toEqual({
      phone: '555-9999',
      email: 'agent@example.com',
      name: 'Jane',
    });
  });

  it('parses amenities from string', () => {
    const raw: RawListing = {
      url: 'https://example.com/listing',
      amenities: 'Pool, Gym, Parking',
    };

    const result = normalizeListing(raw, BASE_URL);
    expect(result.amenitiesJson).toEqual(['Pool', 'Gym', 'Parking']);
  });

  it('handles null/undefined fields gracefully', () => {
    const raw: RawListing = {
      url: 'https://example.com/listing',
    };

    const result = normalizeListing(raw, BASE_URL);
    expect(result.sourceListingId).toBeNull();
    expect(result.title).toBeNull();
    expect(result.priceMin).toBeNull();
    expect(result.beds).toBeNull();
    expect(result.imageUrls).toEqual([]);
    expect(result.contactJson).toBeNull();
  });
});
