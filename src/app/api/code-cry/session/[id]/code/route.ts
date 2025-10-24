export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

// GET — fetch code content
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const s = await prisma.codeCrySession.findUnique({ where: { id: params.id } });
  if (!s) return jsonError('Session not found.', 404);
  return NextResponse.json({ data: { content: (s as any).codeContent ?? '', language: (s as any).codeLanguage ?? 'plaintext', updatedAt: s.updatedAt } });
}

// POST — update code content (host-only)
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const actor = await getCurrentUser();
  if (!actor) return jsonError('Authentication required.', 401);
  const s = await prisma.codeCrySession.findUnique({ where: { id: params.id } });
  if (!s) return jsonError('Session not found.', 404);
  if (s.hostId !== actor.id) return jsonError('Only host can update code.', 403);
  const body = await req.json().catch(() => ({}));
  const content = typeof body.content === 'string' ? body.content : '';
  const language = typeof body.language === 'string' ? body.language : undefined;
  const updated = await prisma.codeCrySession.update({ where: { id: s.id }, data: { codeContent: content, ...(language ? { codeLanguage: language } : {}) } });
  return NextResponse.json({ data: { content: (updated as any).codeContent ?? '', language: (updated as any).codeLanguage ?? 'plaintext', updatedAt: updated.updatedAt } });
}

