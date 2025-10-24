export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

// POST /api/code-cry/session/[id]/end — end session (host only)
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return jsonError('Authentication required.', 401);

  const session = await prisma.codeCrySession.findUnique({ where: { id: params.id } });
  if (!session) return jsonError('Session not found.', 404);
  if (session.hostId !== user.id) return jsonError('Only host can end the session.', 403);
  if (session.endedAt) return jsonError('Session already ended.', 400);

  const updated = await prisma.codeCrySession.update({
    where: { id: session.id },
    data: { endedAt: new Date(), isChatClosed: true },
  });

  return NextResponse.json({ data: updated });
}

