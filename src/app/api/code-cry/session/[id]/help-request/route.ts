export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { parseHelpRequestInput } from '@/lib/validators';
import { getClientKey, rateLimit } from '@/lib/ratelimit';

function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

// POST /api/code-cry/session/[id]/help-request — raise hand / request help
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return jsonError('Login required to request help.', 401);
  if (!rateLimit(`help:${params.id}:${getClientKey((req as any).headers)}`, { rate: 1, perMs: 5000, burst: 2 })) {
    return jsonError('Slow down.', 429);
  }

  let input;
  try {
    input = parseHelpRequestInput(await req.json());
  } catch (error: any) {
    return jsonError('Invalid help request.', 422, error?.flatten?.() ?? String(error));
  }

  const session = await prisma.codeCrySession.findUnique({ where: { id: params.id } });
  if (!session) return jsonError('Session not found.', 404);
  if ((session as any).isViewOnly && session.hostId !== user.id) {
    return jsonError('Session is currently view-only.', 403);
  }
  // Ban guard
  const ban = await (prisma as any).codeCryBan.findUnique({ where: { sessionId_userId: { sessionId: params.id, userId: user.id } } });
  if (ban) return jsonError('You are banned from this session.', 403);

  const isAnonymous = Boolean(input.isAnonymous);
  const requesterName = isAnonymous
    ? input.requesterName?.trim() || `CryingPenguin${Math.floor(100 + Math.random() * 900)}`
    : (user.name ?? 'User');

  const reqRecord = await prisma.helpRequest.create({
    data: {
      sessionId: session.id,
      requesterId: isAnonymous ? null : user.id,
      isAnonymous,
      requesterName,
      topic: input.topic,
      details: input.details,
    },
  });

  return NextResponse.json({ data: reqRecord }, { status: 201 });
}
