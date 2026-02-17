import { PrismaClient } from '../../node_modules/.prisma/scraper-client'

const globalForPrisma = globalThis as unknown as {
  scraperPrisma: PrismaClient | undefined
}

export const scraperPrisma =
  globalForPrisma.scraperPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.scraperPrisma = scraperPrisma
