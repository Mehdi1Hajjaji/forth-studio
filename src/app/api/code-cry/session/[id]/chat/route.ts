export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { parseChatMessageInput } from '@/lib/validators';
import { getClientKey, rateLimit } from '@/lib/ratelimit';

function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

// POST /api/code-cry/session/[id]/chat — post a chat message (auth required)
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return jsonError('Login required to chat.', 401);
  // Basic rate limit per client
  if (!rateLimit(`chat:${params.id}:${getClientKey((req as any).headers)}`, { rate: 2, perMs: 2000, burst: 3 })) {
    return jsonError('Slow down.', 429);
  }

  let input;
  try {
    input = parseChatMessageInput(await req.json());
  } catch (error: any) {
    return jsonError('Invalid chat message.', 422, error?.flatten?.() ?? String(error));
  }

  const session = await prisma.codeCrySession.findUnique({ where: { id: params.id } });
  if (!session) return jsonError('Session not found.', 404);
  if ((session as any).isViewOnly && session.hostId !== user.id) {
    return jsonError('Session is currently view-only.', 403);
  }
  if ((session as any).isChatClosed) return jsonError('Chat is closed for this session.', 403);

  // Moderation guards: ban/mute
  const [ban, mute] = await Promise.all([
    (prisma as any).codeCryBan.findUnique({ where: { sessionId_userId: { sessionId: params.id, userId: user.id } } }),
    (prisma as any).codeCryMute.findUnique({ where: { sessionId_userId: { sessionId: params.id, userId: user.id } } }),
  ]);
  if (ban) return jsonError('You are banned from this session.', 403);
  if (mute) return jsonError('You are muted in this session.', 403);

  const isAnonymous = Boolean(input.isAnonymous);
  const senderName = isAnonymous
    ? input.senderName?.trim() || `CryingPenguin${Math.floor(100 + Math.random() * 900)}`
    : (user.name ?? 'User');

  const message = await prisma.chatMessage.create({
    data: {
      sessionId: session.id,
      senderId: isAnonymous ? null : user.id,
      isAnonymous,
      senderName,
      message: input.message,
    },
  });

  return NextResponse.json({ data: message }, { status: 201 });
}
