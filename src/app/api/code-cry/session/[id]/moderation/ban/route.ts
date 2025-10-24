export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { NextResponse, type NextRequest } from 'next/server';

function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

async function ensureHost(sessionId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('401');
  const s = await prisma.codeCrySession.findUnique({ where: { id: sessionId } });
  if (!s) throw new Error('404');
  if (s.hostId !== user.id) throw new Error('403');
  return user;
}

// POST — ban
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  let payload: any;
  try { payload = await req.json(); } catch { payload = {}; }
  const targetId = String(payload?.userId || '');
  const reason = payload?.reason ? String(payload.reason) : undefined;

  try {
    const actor = await ensureHost(params.id);
    await (prisma as any).codeCryBan.upsert({
      where: { sessionId_userId: { sessionId: params.id, userId: targetId } },
      update: { reason },
      create: { sessionId: params.id, userId: targetId, reason, createdBy: actor.id },
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const code = e?.message === '401' ? 401 : e?.message === '403' ? 403 : e?.message === '404' ? 404 : 400;
    return jsonError('Failed to ban user.', code, e?.message ?? String(e));
  }
}

// DELETE — unban
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return jsonError('userId is required', 422);
  try {
    await ensureHost(params.id);
    await (prisma as any).codeCryBan.delete({ where: { sessionId_userId: { sessionId: params.id, userId } } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const code = e?.message === '401' ? 401 : e?.message === '403' ? 403 : e?.message === '404' ? 404 : 400;
    return jsonError('Failed to unban user.', code, e?.message ?? String(e));
  }
}

