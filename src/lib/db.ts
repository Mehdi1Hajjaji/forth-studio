import type { PrismaClient } from "@prisma/client";
import prisma from "@/lib/prisma";

declare global {
  // eslint-disable-next-line no-var, vars-on-top
  var cachedDb: PrismaClient | undefined;
}

const db = global.cachedDb ?? prisma;

if (process.env.NODE_ENV !== "production") {
  global.cachedDb = db;
}

export type { Prisma } from "@prisma/client";

export default db;
