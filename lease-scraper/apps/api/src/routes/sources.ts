import { Router, type Request, type Response } from 'express';
import { getPrisma } from '@michigan-rental/shared';

const router = Router();

/**
 * GET /sources
 * List all ingestion sources.
 */
router.get('/', async (_req: Request, res: Response) => {
  const prisma = getPrisma();

  const sources = await prisma.source.findMany({
    include: {
      _count: {
        select: { listings: true, ingestRuns: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  res.json({ data: sources });
});

export { router as sourcesRouter };
