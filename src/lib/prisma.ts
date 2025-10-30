// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// Keep a single Prisma instance in dev (HMR-safe)
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // 'query' logging is noisy & can cause perf hits; warn/error is enough
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
