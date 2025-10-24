export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

// POST — mark help request resolved (host-only)
export async function POST(_req: Request, { params }: { params: { id: string, requestId: string } }) {
  const actor = await getCurrentUser();
  if (!actor) return jsonError('Authentication required.', 401);
  const s = await prisma.codeCrySession.findUnique({ where: { id: params.id } });
  if (!s) return jsonError('Session not found.', 404);
  if (s.hostId !== actor.id) return jsonError('Only host can resolve.', 403);

  const r = await prisma.helpRequest.findUnique({ where: { id: params.requestId } });
  if (!r || r.sessionId !== s.id) return jsonError('Request not found.', 404);

  const updated = await prisma.helpRequest.update({ where: { id: r.id }, data: { status: 'RESOLVED' } as any });
  return NextResponse.json({ data: updated });
}

