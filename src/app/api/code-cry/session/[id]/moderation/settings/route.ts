export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

// POST — update session moderation toggles (host-only)
// Body can include: { isChatClosed?: boolean, isViewOnly?: boolean, isStuck?: boolean }
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const actor = await getCurrentUser();
  if (!actor) return jsonError('Authentication required.', 401);
  const s = await prisma.codeCrySession.findUnique({ where: { id: params.id } });
  if (!s) return jsonError('Session not found.', 404);
  if (s.hostId !== actor.id) return jsonError('Only host can update settings.', 403);

  const body = await req.json().catch(() => ({}));
  const data: any = {};
  if (typeof body.isChatClosed === 'boolean') data.isChatClosed = body.isChatClosed;
  if (typeof body.isViewOnly === 'boolean') data.isViewOnly = body.isViewOnly;
  if (typeof body.isStuck === 'boolean') data.isStuck = body.isStuck;

  const updated = await prisma.codeCrySession.update({ where: { id: s.id }, data });
  return NextResponse.json({ data: updated });
}

