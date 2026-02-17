import { Router, type Request, type Response } from 'express';
import { getPrisma, IngestRunQuerySchema, createLogger } from '@michigan-rental/shared';
import { adminAuth } from '../middleware/admin-auth';
import { spawn } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';

const router = Router();
const logger = createLogger('admin-api');

// All admin routes require token auth
router.use(adminAuth);

/**
 * POST /admin/ingest/run
 * Trigger a sync run. Spawns the scraper CLI as a child process.
 */
router.post('/ingest/run', async (req: Request, res: Response) => {
  const prisma = getPrisma();
  const source = req.body?.source || 'michiganrental';
  const limit = req.body?.limit || 0;

  const sourceRecord = await prisma.source.findUnique({ where: { name: source } });
  if (!sourceRecord) {
    // Auto-create the source if it doesn't exist
    await prisma.source.create({
      data: { name: source, baseUrl: 'https://www.michiganrental.com' },
    });
  }

  // Create a run record
  const run = await prisma.ingestRun.create({
    data: {
      sourceId: sourceRecord?.id || (await prisma.source.findUnique({ where: { name: source } }))!.id,
      status: 'queued',
    },
  });

  // Spawn the scraper CLI as a child process
  const scraperDir = path.resolve(__dirname, '../../../scraper');
  const child = spawn(
    'npx',
    ['tsx', 'src/cli/index.ts', 'sync', '--source', source, '--limit', String(limit)],
    {
      cwd: scraperDir,
      env: { ...process.env },
      stdio: 'pipe',
      detached: false,
    }
  );

  child.stdout?.on('data', (data: Buffer) => {
    logger.info({ runId: run.id }, data.toString().trim());
  });

  child.stderr?.on('data', (data: Buffer) => {
    logger.warn({ runId: run.id }, data.toString().trim());
  });

  child.on('close', async (code) => {
    logger.info({ runId: run.id, exitCode: code }, 'Sync process completed');
    if (code !== 0) {
      await prisma.ingestRun.update({
        where: { id: run.id },
        data: {
          status: 'failed',
          finishedAt: new Date(),
          errorsJson: [{ message: `Process exited with code ${code}` }],
        },
      }).catch(() => {});
    }
  });

  res.status(202).json({
    message: 'Sync run queued',
    data: { runId: run.id },
  });
});

/**
 * GET /admin/ingest/runs
 * List recent ingest runs.
 */
router.get('/ingest/runs', async (req: Request, res: Response) => {
  const prisma = getPrisma();
  const query = IngestRunQuerySchema.parse(req.query);
  const skip = (query.page - 1) * query.limit;

  const [runs, total] = await Promise.all([
    prisma.ingestRun.findMany({
      include: {
        source: { select: { name: true } },
      },
      orderBy: { startedAt: 'desc' },
      skip,
      take: query.limit,
    }),
    prisma.ingestRun.count(),
  ]);

  res.json({
    data: runs,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  });
});

/**
 * GET /admin/ingest/runs/:id
 * Get details of a specific ingest run.
 */
router.get('/ingest/runs/:id', async (req: Request, res: Response) => {
  const prisma = getPrisma();
  const id = req.params['id'] as string;
  const run = await prisma.ingestRun.findUnique({
    where: { id },
    include: {
      source: true,
    },
  });

  if (!run) {
    res.status(404).json({ error: 'Ingest run not found' });
    return;
  }

  res.json({ data: run });
});

/**
 * DELETE /admin/listings/:id
 * Remove a listing and its associated images.
 */
router.delete('/listings/:id', async (req: Request, res: Response) => {
  const prisma = getPrisma();
  const id = req.params['id'] as string;

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!listing) {
    res.status(404).json({ error: 'Listing not found' });
    return;
  }

  // Delete from DB (images cascade)
  await prisma.listing.delete({ where: { id } });

  // Clean up image files from disk
  try {
    const imageDir = process.env.LOCAL_IMAGE_DIR || './data/images';
    for (const img of listing.images) {
      if (img.storedPath) {
        const fullPath = path.join(imageDir, img.storedPath);
        await fs.rm(fullPath, { force: true }).catch(() => {});
      }
    }
  } catch {
    // Non-critical
  }

  logger.info({ listingId: id, imagesRemoved: listing.images.length }, 'Listing deleted');

  res.json({
    message: 'Listing deleted',
    data: { id, imagesRemoved: listing.images.length },
  });
});

export { router as adminRouter };
