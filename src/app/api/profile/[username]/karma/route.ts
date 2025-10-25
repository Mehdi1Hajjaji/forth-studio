import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export async function GET(_req: Request, { params }: { params: { username: string } }) {
  const viewer = await getCurrentUser();
  const profile = await prisma.user.findUnique({ where: { username: params.username.toLowerCase() }, select: { id: true } });
  if (!profile) return jsonError('Profile not found', 404);
  if (!viewer || viewer.id !== profile.id) return jsonError('Forbidden', 403);

  const entries = await prisma.userKarma.findMany({
    where: { recipientId: profile.id },
    include: { sender: { select: { username: true, name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json({
    data: entries.map(e => ({ id: e.id, date: e.createdAt, reason: e.reason, sender: e.sender?.username ?? 'Anonymous' })),
  });
}

