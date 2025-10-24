export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createJoinToken, type LiveKitRole } from '@/lib/livekit';
import { consumePublisherGrant } from '@/lib/session-perms';

function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

// POST /api/code-cry/session/[id]/token — get LiveKit token for room join
// Body: { role: 'publisher' | 'subscriber', isAnonymous?: boolean, displayName?: string }
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return jsonError('Authentication required.', 401);

  const body = await req.json().catch(() => ({}));
  const requestedRole: LiveKitRole = body?.role === 'publisher' ? 'publisher' : 'subscriber';
  const isAnonymous = Boolean(body?.isAnonymous);
  const displayName: string | undefined = body?.displayName?.toString();

  const session = await prisma.codeCrySession.findUnique({ where: { id: params.id } });
  if (!session) return jsonError('Session not found.', 404);

  // Only the host can request a publisher token, unless host granted promotion for this user
  let role: LiveKitRole = 'subscriber';
  if (session.hostId === user.id) {
    role = requestedRole;
  } else if (requestedRole === 'publisher' && consumePublisherGrant(session.id, user.id)) {
    role = 'publisher';
  }

  const identity = isAnonymous ? `anon-${user.id}-${Math.random().toString(36).slice(2, 8)}` : user.id;
  const name = isAnonymous ? displayName || 'Anonymous' : (user.name ?? 'User');
  let token: string;
  try {
    token = await createJoinToken({ roomName: session.roomName, identity, name, role });
  } catch (e: any) {
    return jsonError('LiveKit not configured.', 500, e?.message ?? String(e));
  }

  return NextResponse.json({
    data: {
      token,
      url: process.env.LIVEKIT_URL,
      roomName: session.roomName,
      role,
    },
  });
}
