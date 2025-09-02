import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
config(); // This must be called as early as possible

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is missing at runtime.");
  throw new Error("Missing DATABASE_URL. Make sure .env is loaded.");
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Use verbose logging only in development
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"],
  });

// Avoid creating new PrismaClient in hot reloads (dev only)
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export { prisma };
