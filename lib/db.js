import { PrismaClient } from '@prisma/client';
import { withOptimize } from "@prisma/extension-optimize";

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // log: ['query'], // Optional: Logs SQL queries for debugging
  }).$extends(
    withOptimize({
      apiKey: process.env.OPTIMIZE_API_KEY
    })
  );

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
