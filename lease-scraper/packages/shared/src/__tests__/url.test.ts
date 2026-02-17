import { describe, it, expect } from 'vitest';
import { canonicalizeUrl, extensionFromUrl, extensionFromMime } from '../utils/url';

describe('canonicalizeUrl', () => {
  it('forces https', () => {
    expect(canonicalizeUrl('http://example.com/listing/123')).toBe(
      'https://example.com/listing/123'
    );
  });

  it('strips tracking query params', () => {
    expect(
      canonicalizeUrl('https://example.com/listing?utm_source=google&id=5&fbclid=abc')
    ).toBe('https://example.com/listing?id=5');
  });

  it('trims trailing slashes (except root)', () => {
    expect(canonicalizeUrl('https://example.com/listing/')).toBe(
      'https://example.com/listing'
    );
    expect(canonicalizeUrl('https://example.com/')).toBe('https://example.com/');
  });

  it('lowercases hostname', () => {
    expect(canonicalizeUrl('https://EXAMPLE.COM/Listing/123')).toBe(
      'https://example.com/Listing/123'
    );
  });

  it('sorts remaining query params', () => {
    expect(canonicalizeUrl('https://example.com/search?z=1&a=2')).toBe(
      'https://example.com/search?a=2&z=1'
    );
  });

  it('handles invalid URLs gracefully', () => {
    expect(canonicalizeUrl('not-a-url')).toBe('not-a-url');
  });

  it('strips multiple tracking params together', () => {
    const input =
      'http://EXAMPLE.COM/listing/42/?utm_source=x&utm_medium=y&gclid=z&keep=me';
    const result = canonicalizeUrl(input);
    expect(result).toBe('https://example.com/listing/42?keep=me');
  });
});

describe('extensionFromUrl', () => {
  it('extracts jpg', () => {
    expect(extensionFromUrl('https://cdn.example.com/photo.jpg')).toBe('jpg');
  });

  it('extracts png with query string', () => {
    expect(extensionFromUrl('https://cdn.example.com/photo.png?w=800')).toBe('png');
  });

  it('returns empty for no extension', () => {
    expect(extensionFromUrl('https://cdn.example.com/photo')).toBe('');
  });

  it('handles invalid URL', () => {
    expect(extensionFromUrl('not-a-url')).toBe('');
  });
});

describe('extensionFromMime', () => {
  it('maps image/jpeg to jpg', () => {
    expect(extensionFromMime('image/jpeg')).toBe('jpg');
  });

  it('maps image/png to png', () => {
    expect(extensionFromMime('image/png')).toBe('png');
  });

  it('maps image/webp to webp', () => {
    expect(extensionFromMime('image/webp')).toBe('webp');
  });

  it('defaults to jpg for unknown', () => {
    expect(extensionFromMime('application/octet-stream')).toBe('jpg');
  });
});
