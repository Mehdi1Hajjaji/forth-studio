import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { suggestChallengeSchema } from '@/lib/schemas';
import { Resend } from 'resend';
import prisma from '@/lib/prisma';

function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export async function POST(req: Request) {
  const viewer = await getCurrentUser();
  if (!viewer) return jsonError('Authentication required', 401);
  let input;
  try {
    input = suggestChallengeSchema.parse(await req.json());
  } catch (e: any) {
    return jsonError('Invalid suggestion', 422, e?.errors ?? String(e));
  }

  // Persist to database for admin review
  try {
    await prisma.challengeSuggestion.create({
      data: {
        title: input.title,
        topic: input.topic,
        difficulty: input.difficulty,
        details: input.details,
        createdById: (viewer as any).id,
      },
    });
  } catch (e: any) {
    return jsonError('Could not save suggestion', 500, e?.message ?? String(e));
  }

  // Optional: email to inbox if configured. Otherwise, just acknowledge receipt.
  const inbox = process.env.SUGGEST_INBOX_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;
  if (inbox && apiKey) {
    try {
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? 'no-reply@forth.studio',
        to: inbox,
        subject: `New challenge suggestion: ${input.title}`,
        text: `From: ${viewer.name ?? viewer.email} (@${(viewer as any).username ?? 'unknown'})\n\nTopic: ${input.topic}\nDifficulty: ${input.difficulty}\n\n${input.details}`,
      });
    } catch (err) {
      // Non-fatal; continue
    }
  }

  return NextResponse.json({ ok: true });
}
