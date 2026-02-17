import { Router, type Request, type Response } from 'express';
import { getPrisma, ListingQuerySchema } from '@michigan-rental/shared';
import type { Prisma } from '@prisma/client';

const router = Router();

/**
 * GET /listings
 * List listings with filters and pagination.
 */
router.get('/', async (req: Request, res: Response) => {
  const prisma = getPrisma();
  const query = ListingQuerySchema.parse(req.query);

  const where: Prisma.ListingWhereInput = {};

  if (query.city) {
    where.city = { equals: query.city, mode: 'insensitive' };
  }

  if (query.minPrice !== undefined) {
    where.priceMin = { gte: query.minPrice };
  }

  if (query.maxPrice !== undefined) {
    where.priceMax = { lte: query.maxPrice };
  }

  if (query.beds !== undefined) {
    where.beds = { gte: query.beds };
  }

  if (query.baths !== undefined) {
    where.baths = { gte: query.baths };
  }

  if (query.bounds) {
    const [minLat, minLng, maxLat, maxLng] = query.bounds.split(',').map(Number);
    where.lat = { gte: minLat, lte: maxLat };
    where.lng = { gte: minLng, lte: maxLng };
  }

  if (query.availabilityBefore) {
    where.availabilityDate = { ...((where.availabilityDate as object) || {}), lte: query.availabilityBefore };
  }

  if (query.availabilityAfter) {
    where.availabilityDate = { ...((where.availabilityDate as object) || {}), gte: query.availabilityAfter };
  }

  if (query.q) {
    where.OR = [
      { title: { contains: query.q, mode: 'insensitive' } },
      { description: { contains: query.q, mode: 'insensitive' } },
      { street: { contains: query.q, mode: 'insensitive' } },
      { city: { contains: query.q, mode: 'insensitive' } },
    ];
  }

  const skip = (query.page - 1) * query.limit;

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            originalUrl: true,
            storedUrl: true,
            width: true,
            height: true,
            mimeType: true,
            sortOrder: true,
          },
        },
        source: {
          select: { name: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: query.limit,
    }),
    prisma.listing.count({ where }),
  ]);

  res.json({
    data: listings,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  });
});

/**
 * GET /listings/:id
 * Get a single listing with all images.
 */
router.get('/:id', async (req: Request, res: Response) => {
  const prisma = getPrisma();
  const listing = await prisma.listing.findUnique({
    where: { id: req.params['id'] as string },
    include: {
      images: {
        orderBy: { sortOrder: 'asc' },
      },
      source: true,
    },
  });

  if (!listing) {
    res.status(404).json({ error: 'Listing not found' });
    return;
  }

  res.json({ data: listing });
});

export { router as listingsRouter };
