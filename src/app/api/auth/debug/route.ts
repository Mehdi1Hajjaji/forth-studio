import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const hasDbUrl = Boolean(process.env.DATABASE_URL);
  const hasNextAuthUrl = Boolean(process.env.NEXTAUTH_URL);
  const hasSecret = Boolean(process.env.NEXTAUTH_SECRET);
  const hasAppUrl = Boolean(process.env.NEXT_PUBLIC_APP_URL);

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

  return NextResponse.json({
    env: {
      DATABASE_URL: hasDbUrl,
      NEXTAUTH_URL: hasNextAuthUrl,
      NEXTAUTH_SECRET: hasSecret,
      NEXT_PUBLIC_APP_URL: hasAppUrl,
    },
    db: { ok: dbOk, userCount, adminCount, error },
    hints: [
      !hasDbUrl && 'Set DATABASE_URL to your production Postgres connection string',
      !hasSecret && 'Set NEXTAUTH_SECRET (openssl rand -base64 32)',
      !hasNextAuthUrl && 'Set NEXTAUTH_URL to your deployed URL (https://...vercel.app)',
      !hasAppUrl && 'Set NEXT_PUBLIC_APP_URL for password reset links',
      (!dbOk && 'Ensure the database is reachable from Vercel (network + correct URL)'),
      (!dbOk && 'Run migrations: npm run db:deploy against the production DB'),
    ].filter(Boolean),
  });
}

