export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { grantPublisher } from '@/lib/session-perms';

function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

// POST — host grants temporary publisher permission to a user for this session.
// Body: { userId: string }
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const actor = await getCurrentUser();
  if (!actor) return jsonError('Authentication required.', 401);
  const s = await prisma.codeCrySession.findUnique({ where: { id: params.id } });
  if (!s) return jsonError('Session not found.', 404);
  if (s.hostId !== actor.id) return jsonError('Only host can promote users.', 403);

  const body = await req.json().catch(() => ({}));
  const userId = String(body?.userId || '');
  if (!userId) return jsonError('userId is required', 422);

  grantPublisher(s.id, userId);

  return NextResponse.json({ ok: true });
}

