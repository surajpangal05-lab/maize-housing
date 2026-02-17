import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { extensionFromUrl, extensionFromMime, withRetry, RateLimiter, type Logger, createLogger, getPrisma } from '@michigan-rental/shared';
import type { PrismaClient } from '@prisma/client';

export interface ImageDownloaderOptions {
  concurrency?: number;
  storageMode?: 'local' | 's3';
  localDir?: string;
  s3Endpoint?: string;
  s3Bucket?: string;
  s3AccessKey?: string;
  s3SecretKey?: string;
  s3Region?: string;
  logger?: Logger;
}

interface DownloadResult {
  originalUrl: string;
  storedPath: string;
  storedUrl: string;
  width: number | null;
  height: number | null;
  mimeType: string;
  checksumSha256: string;
}

/**
 * Downloads listing images with concurrency control, deduplication,
 * and exponential backoff retry.
 */
export class ImageDownloader {
  private concurrency: number;
  private storageMode: 'local' | 's3';
  private localDir: string;
  private logger: Logger;
  private prisma: PrismaClient;
  private rateLimiter: RateLimiter;

  constructor(options: ImageDownloaderOptions = {}) {
    this.concurrency = options.concurrency || 4;
    this.storageMode = options.storageMode || 'local';
    this.localDir = options.localDir || './data/images';
    this.logger = options.logger || createLogger('image-downloader');
    this.prisma = getPrisma();
    this.rateLimiter = new RateLimiter(2);
  }

  /**
   * Download all images for a listing. Returns number of images downloaded.
   */
  async downloadListingImages(listingId: string, imageUrls: string[]): Promise<number> {
    if (imageUrls.length === 0) return 0;

    // Check if SKIP_IMAGE_DOWNLOAD is set - just store URLs without downloading
    if (process.env.SKIP_IMAGE_DOWNLOAD === 'true') {
      return this.storeImageUrls(listingId, imageUrls);
    }

    let downloaded = 0;

    // Process in batches based on concurrency
    for (let i = 0; i < imageUrls.length; i += this.concurrency) {
      const batch = imageUrls.slice(i, i + this.concurrency);
      const results = await Promise.allSettled(
        batch.map((url, batchIdx) =>
          this.downloadAndStore(listingId, url, i + batchIdx)
        )
      );

      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          downloaded++;
        } else if (result.status === 'rejected') {
          this.logger.warn(
            { listingId, error: result.reason?.message },
            'Failed to download image'
          );
        }
      }
    }

    return downloaded;
  }

  /**
   * Store image URLs without downloading (faster for production).
   * Just saves the original URLs to the database.
   */
  async storeImageUrls(listingId: string, imageUrls: string[]): Promise<number> {
    if (imageUrls.length === 0) return 0;

    let stored = 0;

    for (let i = 0; i < imageUrls.length; i++) {
      const url = imageUrls[i];
      try {
        // Check if this image URL already exists for this listing
        const existing = await this.prisma.listingImage.findFirst({
          where: { listingId, originalUrl: url },
        });

        if (!existing) {
          await this.prisma.listingImage.create({
            data: {
              listingId,
              originalUrl: url,
              sortOrder: i,
            },
          });
          stored++;
        }
      } catch (err) {
        this.logger.warn({ listingId, url, error: (err as Error).message }, 'Failed to store image URL');
      }
    }

    return stored;
  }

  private async downloadAndStore(
    listingId: string,
    imageUrl: string,
    sortOrder: number
  ): Promise<DownloadResult | null> {
    try {
      const host = new URL(imageUrl).hostname;
      await this.rateLimiter.wait(host);

      // Download with retry
      const { buffer, mimeType } = await withRetry(
        async () => {
          const response = await fetch(imageUrl, {
            headers: {
              'User-Agent': 'MichiganRentalBot/1.0',
              'Accept': 'image/*',
            },
            signal: AbortSignal.timeout(30000),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const contentType = response.headers.get('content-type') || 'image/jpeg';
          const arrayBuffer = await response.arrayBuffer();
          return { buffer: Buffer.from(arrayBuffer), mimeType: contentType.split(';')[0].trim() };
        },
        { maxRetries: 3, logger: this.logger }
      );

      // Compute checksum
      const checksumSha256 = crypto.createHash('sha256').update(buffer).digest('hex');

      // Check if we already have this image (by checksum)
      const existingImage = await this.prisma.listingImage.findFirst({
        where: { checksumSha256 },
      });

      if (existingImage && existingImage.listingId === listingId) {
        this.logger.debug({ checksumSha256 }, 'Image already exists for this listing, skipping');
        return null;
      }

      // Determine extension and path
      const ext = extensionFromUrl(imageUrl) || extensionFromMime(mimeType);
      const filename = `${checksumSha256}.${ext}`;

      let storedPath: string;
      let storedUrl: string;

      if (this.storageMode === 'local') {
        storedPath = path.join(listingId, filename);
        const fullPath = path.join(this.localDir, storedPath);
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, buffer);
        storedUrl = `/images/${storedPath}`;
      } else {
        // S3 placeholder - would use AWS SDK
        storedPath = `images/${listingId}/${filename}`;
        storedUrl = storedPath;
        this.logger.warn('S3 storage not implemented, saving locally');
        const fullPath = path.join(this.localDir, listingId, filename);
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, buffer);
        storedUrl = `/images/${listingId}/${filename}`;
      }

      // Detect image dimensions from buffer header (basic approach)
      const dimensions = detectImageDimensions(buffer);

      // Store image record in DB
      await this.prisma.listingImage.upsert({
        where: {
          id: existingImage?.id || 'new',
        },
        create: {
          listingId,
          sortOrder,
          originalUrl: imageUrl,
          storedUrl,
          storedPath,
          width: dimensions?.width || null,
          height: dimensions?.height || null,
          mimeType,
          checksumSha256,
        },
        update: {
          sortOrder,
          originalUrl: imageUrl,
          storedUrl,
          storedPath,
          width: dimensions?.width || null,
          height: dimensions?.height || null,
          mimeType,
        },
      });

      return {
        originalUrl: imageUrl,
        storedPath,
        storedUrl,
        width: dimensions?.width || null,
        height: dimensions?.height || null,
        mimeType,
        checksumSha256,
      };
    } catch (err) {
      this.logger.warn(
        { imageUrl, error: (err as Error).message },
        'Image download failed after retries'
      );
      return null;
    }
  }
}

/**
 * Basic image dimension detection from buffer header bytes.
 */
function detectImageDimensions(buffer: Buffer): { width: number; height: number } | null {
  try {
    // PNG: width at offset 16, height at offset 20 (4 bytes each, big-endian)
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      return {
        width: buffer.readUInt32BE(16),
        height: buffer.readUInt32BE(20),
      };
    }

    // JPEG: scan for SOF marker
    if (buffer[0] === 0xff && buffer[1] === 0xd8) {
      let offset = 2;
      while (offset < buffer.length - 9) {
        if (buffer[offset] !== 0xff) break;
        const marker = buffer[offset + 1];
        if (marker >= 0xc0 && marker <= 0xc3) {
          return {
            height: buffer.readUInt16BE(offset + 5),
            width: buffer.readUInt16BE(offset + 7),
          };
        }
        const segmentLen = buffer.readUInt16BE(offset + 2);
        offset += 2 + segmentLen;
      }
    }

    // GIF
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
      return {
        width: buffer.readUInt16LE(6),
        height: buffer.readUInt16LE(8),
      };
    }

    // WebP
    if (
      buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
    ) {
      // VP8
      if (buffer[12] === 0x56 && buffer[13] === 0x50 && buffer[14] === 0x38 && buffer[15] === 0x20) {
        return {
          width: buffer.readUInt16LE(26) & 0x3fff,
          height: buffer.readUInt16LE(28) & 0x3fff,
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}
