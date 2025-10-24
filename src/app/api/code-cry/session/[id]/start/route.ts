export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

// POST /api/code-cry/session/[id]/start — start session (host only)
export async function POST(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getCurrentUser();
  if (!user) return jsonError('Authentication required.', 401);

  const session = await prisma.codeCrySession.findUnique({ where: { id: params.id } });
  if (!session) return jsonError('Session not found.', 404);
  if (session.hostId !== user.id) return jsonError('Only host can start the session.', 403);
  if (session.startedAt) return jsonError('Session already started.', 400);

  const updated = await prisma.codeCrySession.update({
    where: { id: session.id },
    data: { startedAt: new Date() },
  });

  return NextResponse.json({ data: updated });
}

