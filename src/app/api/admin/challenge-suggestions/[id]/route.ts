import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await requireAdmin();
  const body = await req.json().catch(() => ({}));
  const status = String(body?.status || '').toUpperCase();
  if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) return jsonError('Invalid status', 422);
  try {
    const updated = await prisma.challengeSuggestion.update({
      where: { id: params.id },
      data: { status: status as any, reviewedAt: new Date() },
      select: { id: true, status: true },
    });
    return NextResponse.json({ ok: true, data: updated });
  } catch (e: any) {
    return jsonError('Update failed', 500, e?.message ?? String(e));
  }
}

