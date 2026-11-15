import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

function createPrismaClient() {
  const client = new PrismaClient();
  // Enable SQLite WAL mode + busy timeout to prevent SQLITE_BUSY under concurrent writes
  client.$executeRawUnsafe('PRAGMA journal_mode = WAL;').catch(() => {});
  client.$executeRawUnsafe('PRAGMA busy_timeout = 5000;').catch(() => {});
  return client;
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
