import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set.");
  }

  const pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }, // Required for Neon serverless PostgreSQL
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// CACHE BYPASSED: Forced refresh for new schema at 2026-05-07T12:40
export const prisma = createPrismaClient();

export default prisma;
