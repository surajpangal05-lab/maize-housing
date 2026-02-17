import { describe, it, expect } from 'vitest';
import { normalizeListing } from '@michigan-rental/shared';
import type { RawListing } from '@michigan-rental/shared';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://www.michiganrental.com';

describe('Normalizer integration with fixture data', () => {
  const fixturePath = path.resolve(__dirname, '../../../../fixtures/sample-listings.json');
  let fixtures: { listings: RawListing[] };

  try {
    const raw = fs.readFileSync(fixturePath, 'utf-8');
    fixtures = JSON.parse(raw);
  } catch {
    fixtures = { listings: [] };
  }

  it('loads fixture data', () => {
    expect(fixtures.listings.length).toBeGreaterThan(0);
  });

  it('normalizes all fixture listings without error', () => {
    for (const raw of fixtures.listings) {
      const result = normalizeListing(raw, BASE_URL);
      expect(result).toBeDefined();
      expect(result.canonicalUrl).toBeTruthy();
    }
  });

  it('normalizes listing mr-001 correctly', () => {
    const raw = fixtures.listings.find((l) => l.id === 'mr-001');
    expect(raw).toBeDefined();

    const result = normalizeListing(raw!, BASE_URL);
    expect(result.sourceListingId).toBe('mr-001');
    expect(result.title).toBe('2BR Apartment near University of Michigan');
    expect(result.city).toBe('Ann Arbor');
    expect(result.state).toBe('MI');
    expect(result.priceMin).toBe(1450);
    expect(result.priceMax).toBe(1450);
    expect(result.beds).toBe(2);
    expect(result.baths).toBe(1);
    expect(result.sqft).toBe(850);
    expect(result.imageUrls).toHaveLength(2);
    expect(result.contactJson?.phone).toBe('734-555-0101');
    expect(result.amenitiesJson).toContain('Parking');
  });

  it('normalizes listing mr-002 with alternate field names', () => {
    const raw = fixtures.listings.find((l) => l.id === 'mr-002');
    expect(raw).toBeDefined();

    const result = normalizeListing(raw!, BASE_URL);
    expect(result.sourceListingId).toBe('mr-002');
    expect(result.title).toBe('Charming 1BR in Kerrytown');
    expect(result.street).toBe('321 N Fourth Ave');
    expect(result.unit).toBe('Unit 3');
    expect(result.lat).toBeCloseTo(42.2845);
    expect(result.lng).toBeCloseTo(-83.7494);
    expect(result.priceMin).toBe(950);
    expect(result.beds).toBe(1);
    expect(result.leaseTerm).toBe('6 months');
    expect(result.deposit).toBe(950);
    expect(result.description).toBe(
      'Cozy one-bedroom in the heart of Kerrytown. Walking distance to farmers market and downtown.'
    );
    expect(result.imageUrls).toHaveLength(1);
    expect(result.contactJson?.name).toBe('Kerrytown Rentals');
  });

  it('normalizes listing mr-003 with price range and fees', () => {
    const raw = fixtures.listings.find((l) => l.id === 'mr-003');
    expect(raw).toBeDefined();

    const result = normalizeListing(raw!, BASE_URL);
    expect(result.sourceListingId).toBe('mr-003');
    expect(result.priceMin).toBe(1800);
    expect(result.priceMax).toBe(2000);
    expect(result.feesJson).toEqual({ petDeposit: 250, application: 50 });
    expect(result.imageUrls).toHaveLength(3);

    // URL should be canonicalized (tracking params stripped)
    expect(result.canonicalUrl).toBe(
      'https://www.michiganrental.com/listing/mr-003'
    );
  });
});
