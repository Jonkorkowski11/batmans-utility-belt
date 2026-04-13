import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  
  // Basic validation to avoid Prisma 7 initialization errors
  if (!url) {
    console.error("DATABASE_URL is not set!");
    return new PrismaClient();
  }

  return new PrismaClient({
    datasource: {
      url: url,
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
