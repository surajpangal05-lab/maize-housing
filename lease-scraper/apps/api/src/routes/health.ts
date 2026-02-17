import { Router, type Request, type Response } from 'express';
import { getPrisma } from '@michigan-rental/shared';

const router = Router();

/**
 * GET /health
 * Health check endpoint.
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const prisma = getPrisma();
    await prisma.$queryRaw`SELECT 1`;

    const [listingCount, sourceCount] = await Promise.all([
      prisma.listing.count(),
      prisma.source.count(),
    ]);

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      counts: {
        listings: listingCount,
        sources: sourceCount,
      },
    });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: (err as Error).message,
    });
  }
});

export { router as healthRouter };
