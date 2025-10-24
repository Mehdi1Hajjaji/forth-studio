export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const actor = await getCurrentUser();
  if (!actor) return jsonError('Authentication required.', 401);
  const s = await prisma.codeCrySession.findUnique({ where: { id: params.id } });
  if (!s) return jsonError('Session not found.', 404);
  if (s.hostId !== actor.id) return jsonError('Only host can view moderation lists.', 403);

  const [mutes, bans] = await Promise.all([
    (prisma as any).codeCryMute.findMany({ where: { sessionId: s.id } }),
    (prisma as any).codeCryBan.findMany({ where: { sessionId: s.id } }),
  ]);
  return NextResponse.json({ mutes, bans });
}

