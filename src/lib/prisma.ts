import { PrismaClient } from "@prisma/client";
// Lightweight runtime fallback: prefer direct Supabase host over pooler when pooler URL is provided.
// This avoids connectivity issues on some hosts. Set FORCE_SUPABASE_DIRECT=0 to disable.

function toDirectSupabaseUrl(poolerUrl: string): string | null {
  try {
    const u = new URL(poolerUrl);
    const host = u.hostname;
    const m = host.match(/^([^.]+)\.pooler\.supabase\.com$/);
    if (!m) return null;
    const ref = m[1];
    const directHost = `db.${ref}.supabase.co`;
    u.hostname = directHost;
    u.port = "5432";
    // ensure sslmode=require and remove pgbouncer specific flags
    if (!u.searchParams.get("sslmode")) u.searchParams.set("sslmode", "require");
    u.searchParams.delete("pgbouncer");
    u.searchParams.delete("connection_limit");
    return u.toString();
  } catch {
    return null;
  }
}

try {
  const url = process.env.DATABASE_URL;
  const force = process.env.FORCE_SUPABASE_DIRECT !== '0';
  if (url && force) {
    const u = new URL(url);
    if (/\.pooler\.supabase\.com$/.test(u.hostname)) {
      const direct = toDirectSupabaseUrl(url);
      if (direct) {
        process.env.DATABASE_URL = direct;
        // eslint-disable-next-line no-console
        console.warn("Using direct Supabase host instead of pooler for Prisma client.");
      }
    }
  }
} catch {}

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
