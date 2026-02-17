import { describe, it, expect } from 'vitest';
import * as crypto from 'crypto';
import { extensionFromUrl, extensionFromMime } from '@michigan-rental/shared';

describe('Image downloader utilities', () => {
  describe('checksum computation', () => {
    it('computes sha256 checksum for a buffer', () => {
      const buffer = Buffer.from('test image data');
      const checksum = crypto.createHash('sha256').update(buffer).digest('hex');
      expect(checksum).toHaveLength(64);
      expect(checksum).toMatch(/^[0-9a-f]{64}$/);
    });

    it('produces same checksum for same data', () => {
      const data = 'identical content';
      const hash1 = crypto.createHash('sha256').update(data).digest('hex');
      const hash2 = crypto.createHash('sha256').update(data).digest('hex');
      expect(hash1).toBe(hash2);
    });

    it('produces different checksum for different data', () => {
      const hash1 = crypto.createHash('sha256').update('data1').digest('hex');
      const hash2 = crypto.createHash('sha256').update('data2').digest('hex');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('extension detection', () => {
    it('extracts extension from URL', () => {
      expect(extensionFromUrl('https://cdn.example.com/img.jpg')).toBe('jpg');
      expect(extensionFromUrl('https://cdn.example.com/img.png?w=200')).toBe('png');
      expect(extensionFromUrl('https://cdn.example.com/img.webp')).toBe('webp');
    });

    it('falls back to MIME type', () => {
      expect(extensionFromMime('image/jpeg')).toBe('jpg');
      expect(extensionFromMime('image/png')).toBe('png');
      expect(extensionFromMime('image/webp')).toBe('webp');
      expect(extensionFromMime('image/gif')).toBe('gif');
    });

    it('handles URLs without extension', () => {
      const ext = extensionFromUrl('https://cdn.example.com/image/12345');
      expect(ext).toBe('');
    });
  });
});
