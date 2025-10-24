export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

// POST /api/code-cry/session/[id]/messages/[messageId]/vote — upvote a message (idempotent)
export async function POST(_req: Request, { params }: { params: { id: string, messageId: string } }) {
  const user = await getCurrentUser();
  if (!user) return jsonError('Authentication required.', 401);

  // Ensure message belongs to session
  const message = await prisma.chatMessage.findUnique({ where: { id: params.messageId } });
  if (!message || message.sessionId !== params.id) return jsonError('Message not found.', 404);

  try {
    await prisma.$transaction(async (tx) => {
      // Record voter; ignore if already exists
      await (tx as any).chatMessageUpvote.create({
        data: { userId: user.id, messageId: message.id },
      }).catch(() => null);

      // Update denormalized counter safely
      const count = await (tx as any).chatMessageUpvote.count({ where: { messageId: message.id } });
      await tx.chatMessage.update({ where: { id: message.id }, data: { upvotes: count } });
    });
  } catch (e: any) {
    return jsonError('Failed to upvote message.', 400, e?.message ?? String(e));
  }

  return NextResponse.json({ ok: true });
}

