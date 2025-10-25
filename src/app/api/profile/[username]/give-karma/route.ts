import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { parseGiveKarmaInput } from '@/lib/validators';

function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export async function POST(req: Request, { params }: { params: { username: string } }) {
  const viewer = await getCurrentUser();
  if (!viewer) return jsonError('Authentication required', 401);

  const recipient = await prisma.user.findUnique({ where: { username: params.username.toLowerCase() }, select: { id: true } });
  if (!recipient) return jsonError('Profile not found', 404);
  if (recipient.id === viewer.id) return jsonError('You cannot give karma to yourself', 400);

  let input;
  try {
    input = parseGiveKarmaInput(await req.json());
  } catch (e: any) {
    return jsonError('Invalid input', 422, e?.errors ?? String(e));
  }

  // rate limit: 1 per week per sender->recipient
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recent = await prisma.userKarma.findFirst({
    where: { recipientId: recipient.id, senderId: viewer.id, createdAt: { gte: since } },
    select: { id: true },
  });
  if (recent) return jsonError('You already sent karma to this user this week', 429);

  await prisma.userKarma.create({
    data: { recipientId: recipient.id, senderId: viewer.id, reason: input.reason },
  });

  const total = await prisma.userKarma.count({ where: { recipientId: recipient.id } });

  return NextResponse.json({ ok: true, karmaTotal: total });
}

