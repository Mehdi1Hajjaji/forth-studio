import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export async function GET(_req: NextRequest, { params }: { params: { username: string } }) {
  const username = params.username.toLowerCase();
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      avatarUrl: true,
      bio: true,
      pronouns: true,
      createdAt: true,
    },
  });
  if (!user) return jsonError('Profile not found', 404);

  const [karmaTotal, solvedCount, stories, failPosts, sessions] = await Promise.all([
    prisma.userKarma.count({ where: { recipientId: user.id } }),
    prisma.submission.count({ where: { userId: user.id, status: 'PASSED' } as any }),
    prisma.story.findMany({ where: { authorId: user.id, status: 'PUBLISHED' as any }, select: { slug: true, title: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 5 }),
    (prisma as any).failPost.findMany({ where: { userId: user.id }, select: { id: true, projectAttempt: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 5 }),
    (prisma as any).codeCrySession.findMany({ where: { hostId: user.id }, select: { id: true, title: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 5 }),
  ]);

  return NextResponse.json({
    profile: user,
    karmaTotal,
    solvedCount,
    recent: {
      stories,
      failPosts,
      codeCrySessions: sessions,
    },
  });
}

