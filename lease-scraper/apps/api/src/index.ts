import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import * as path from 'path';
import { createLogger, disconnectPrisma } from '@michigan-rental/shared';
import { listingsRouter, sourcesRouter, adminRouter, healthRouter } from './routes';
import { errorHandler } from './middleware';

const logger = createLogger('api');

const app = express();
const port = parseInt(process.env.API_PORT || '3000', 10);
const host = process.env.API_HOST || '0.0.0.0';

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(
  pinoHttp({
    logger: logger as any,
    autoLogging: {
      ignore: (req) => (req.url || '').includes('/health'),
    },
  })
);

// Serve images statically
const imageDir = process.env.LOCAL_IMAGE_DIR || './data/images';
app.use('/images', express.static(path.resolve(imageDir)));

// Routes
app.use('/health', healthRouter);
app.use('/listings', listingsRouter);
app.use('/sources', sourcesRouter);
app.use('/admin', adminRouter);

// Error handler
app.use(errorHandler);

// Start server
const server = app.listen(port, host, () => {
  logger.info({ port, host }, 'API server started');
});

// Graceful shutdown
async function shutdown(signal: string) {
  logger.info({ signal }, 'Shutting down gracefully');
  server.close();
  await disconnectPrisma();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export { app };
