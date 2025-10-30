import { PrismaClient } from "@prisma/client";
// Important: Do NOT rewrite Supabase pooler URLs to direct database hosts in production.
// Serverless platforms (like Vercel) must use the connection pooler (port 6543).
// If you need direct connections for migrations, set a separate DIRECT_URL env var
// and reference it from schema.prisma's `directUrl`.

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
