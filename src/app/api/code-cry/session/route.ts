export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { parseCodeCrySessionCreate } from '@/lib/validators';

function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

function generateRoomName() {
  // Non-guessable room name to avoid collisions
  return `codecry_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

// POST /api/code-cry/session — create new session (auth required)
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return jsonError('Authentication required.', 401);
  }

  let input;
  try {
    input = parseCodeCrySessionCreate(await request.json());
  } catch (error: any) {
    return jsonError('Invalid session payload.', 422, error?.flatten?.() ?? String(error));
  }

  const session = await prisma.codeCrySession.create({
    data: {
      hostId: user.id,
      title: input.title,
      description: input.description,
      isAnonymous: input.isAnonymous ?? false,
      scheduledFor: input.scheduledFor,
      roomName: generateRoomName(),
    },
  });

  return NextResponse.json({ data: session }, { status: 201 });
}

