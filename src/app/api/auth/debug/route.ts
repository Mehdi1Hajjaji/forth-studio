import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const hasDbUrl = Boolean(process.env.DATABASE_URL);
  const hasNextAuthUrl = Boolean(process.env.NEXTAUTH_URL);
  const hasSecret = Boolean(process.env.NEXTAUTH_SECRET);
  const hasAppUrl = Boolean(process.env.NEXT_PUBLIC_APP_URL);
  const hasGitHub = Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
  const hasGoogle = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  let dbOk = false;
  let userCount: number | null = null;
  let adminCount: number | null = null;
  let error: string | null = null;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
    userCount = await prisma.user.count();
    adminCount = await prisma.user.count({ where: { role: 'ADMIN' as any } });
  } catch (e: any) {
    error = e?.message ?? String(e);
  }

  // Parse DATABASE_URL safely to show non-sensitive parts
  const parsed = (() => {
    try {
      if (!process.env.DATABASE_URL) return null;
      const u = new URL(process.env.DATABASE_URL);
      const params = Object.fromEntries(u.searchParams.entries());
      return {
        protocol: u.protocol.replace(":", ""),
        host: u.hostname,
        port: u.port || (u.protocol.startsWith('postgres') ? '5432' : ''),
        database: u.pathname.replace(/^\//, ""),
        sslmode: params.sslmode ?? null,
        pgbouncer: params.pgbouncer ?? null,
        connection_limit: params.connection_limit ?? null,
        isPoolerHost: u.hostname.endsWith('.pooler.supabase.com'),
      };
    } catch {
      return null;
    }
  })();

  return NextResponse.json({
    env: {
      DATABASE_URL: hasDbUrl,
      NEXTAUTH_URL: hasNextAuthUrl,
      NEXTAUTH_SECRET: hasSecret,
      NEXT_PUBLIC_APP_URL: hasAppUrl,
      GITHUB_OAUTH: hasGitHub,
      GOOGLE_OAUTH: hasGoogle,
    },
    dbUrlInfo: parsed,
    db: { ok: dbOk, userCount, adminCount, error },
    hints: [
      !hasDbUrl && 'Set DATABASE_URL to your production Postgres connection string',
      !hasSecret && 'Set NEXTAUTH_SECRET (openssl rand -base64 32)',
      !hasNextAuthUrl && 'Set NEXTAUTH_URL to your deployed URL (https://...vercel.app)',
      !hasAppUrl && 'Set NEXT_PUBLIC_APP_URL for password reset links',
      (!dbOk && 'Ensure the database is reachable from Vercel (network + correct host/port/SSL)'),
      (!dbOk && 'If using Supabase, prefer pooler host on 5432 with sslmode=require & pgbouncer=true'),
      (!dbOk && 'Run migrations: npm run db:deploy against the production DB'),
    ].filter(Boolean),
  });
}
