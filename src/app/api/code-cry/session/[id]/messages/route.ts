export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/code-cry/session/[id]/messages?limit=50
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const limit = 100; // keep simple; can add query later
  const messages = await prisma.chatMessage.findMany({
    where: { sessionId: params.id },
    orderBy: { sentAt: 'asc' },
    take: limit,
  });
  return NextResponse.json({ data: messages, meta: { total: messages.length } });
}

