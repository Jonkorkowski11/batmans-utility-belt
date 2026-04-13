import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient() {
  // If we are in production (Vercel), we typically use the default Prisma engine
  // which works perfectly with Postgres/MySQL.
  // SQLite with better-sqlite3 adapter only works in local/Node environments.
  
  if (process.env.NODE_ENV === "production" || process.env.DATABASE_URL?.startsWith("postgres")) {
    return new PrismaClient();
  }

  // Fallback for local development with SQLite
  try {
    const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
    const adapter = new PrismaBetterSqlite3({
      url: process.env.DATABASE_URL || "file:./dev.db",
    });
    return new PrismaClient({ adapter });
  } catch (e) {
    // If adapter fails or isn't available, just return standard client
    return new PrismaClient();
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
