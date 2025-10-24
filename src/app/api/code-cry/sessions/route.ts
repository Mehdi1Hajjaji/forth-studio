export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

// GET /api/code-cry/sessions
// Optional query: status=upcoming|live|past (comma-separated), limit
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const statuses = (searchParams.get('status') || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  const rawLimit = Number.parseInt(searchParams.get('limit') ?? '', 10);
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 50) : 20;

  const now = new Date();
  const where: any = {};

  // Map requested status flags to Prisma filters.
  if (statuses.length === 1) {
    const s = statuses[0];
    if (s === 'upcoming') {
      where.startedAt = null;
      where.scheduledFor = { gt: now };
    } else if (s === 'live') {
      where.startedAt = { not: null };
      where.endedAt = null;
    } else if (s === 'past') {
      where.endedAt = { not: null };
    }
  }

  const orderBy = statuses.includes('live')
    ? [{ startedAt: 'desc' as const }]
    : statuses.includes('upcoming')
      ? [{ scheduledFor: 'asc' as const }]
      : [{ endedAt: 'desc' as const }, { startedAt: 'desc' as const }];

  const sessions = await prisma.codeCrySession.findMany({
    where,
    orderBy,
    take: limit,
    include: {
      host: {
        select: { id: true, username: true, name: true, avatarUrl: true },
      },
    },
  });

  return NextResponse.json({ data: sessions, meta: { total: sessions.length } });
}

