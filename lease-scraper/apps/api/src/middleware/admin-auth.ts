import type { Request, Response, NextFunction } from 'express';

/**
 * Middleware that requires a valid X-Admin-Token header.
 */
export function adminAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers['x-admin-token'];
  const expected = process.env.ADMIN_TOKEN;

  if (!expected) {
    res.status(500).json({ error: 'ADMIN_TOKEN not configured' });
    return;
  }

  if (!token || token !== expected) {
    res.status(401).json({ error: 'Invalid or missing admin token' });
    return;
  }

  next();
}
