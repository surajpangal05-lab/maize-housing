import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { createLogger } from '@michigan-rental/shared';

const logger = createLogger('api-error');

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation error',
      details: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  logger.error({ error: err.message, stack: err.stack }, 'Unhandled error');

  res.status(500).json({
    error: 'Internal server error',
  });
}
