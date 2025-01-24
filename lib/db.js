const { PrismaClient } = require('@prisma/client');
import { withOptimize } from "@prisma/extension-optimize";

const globalForPrisma = globalThis;

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
  errorFormat: 'minimal',
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

module.exports = prisma;
