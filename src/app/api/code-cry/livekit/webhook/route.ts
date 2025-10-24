export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { WebhookReceiver } from 'livekit-server-sdk';

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

// LiveKit webhook receiver.
// Configure your LiveKit Cloud/Webhook to POST to this route.
// Optionally verify signature if LIVEKIT_WEBHOOK_SECRET is set (not implemented here to avoid extra deps).
export async function POST(req: Request) {
  // Prefer raw body for signature verification
  let text: string | null = null;
  try { text = await req.text(); } catch {}
  let payload: any = null;
  try { payload = text ? JSON.parse(text) : await req.json(); } catch { return json({ ok: false, error: 'invalid_json' }, 400); }

  // Optional signature verification (recommended) if LIVEKIT_API_KEY and LIVEKIT_API_SECRET are present
  const key = process.env.LIVEKIT_API_KEY;
  const secret = process.env.LIVEKIT_API_SECRET;
  const auth = (req.headers as any).get?.('authorization') || (req as any).headers?.get?.('authorization');
  if (key && secret && auth && text) {
    try {
      const receiver = new WebhookReceiver(key, secret);
      // will throw if invalid
      receiver.receive(text, auth);
    } catch (e: any) {
      return json({ ok: false, error: 'invalid_signature' }, 401);
    }
  }

  // Attempt to extract room name and a recording/egress URL from a few common shapes.
  const roomName: string | undefined =
    payload?.room?.name || payload?.roomName || payload?.data?.room_name || payload?.event?.room?.name;

  const urlCandidates = [
    payload?.result?.file?.location,
    payload?.result?.file?.downloadUrl,
    payload?.result?.output?.file?.location,
    payload?.data?.file?.url,
    payload?.recording?.url,
    payload?.egress?.result?.file?.location,
  ].filter(Boolean);

  if (!roomName) return json({ ok: true, ignored: true });

  if (urlCandidates.length > 0) {
    const recordingUrl = String(urlCandidates[0]);
    try {
      const updated = await prisma.codeCrySession.update({
        where: { roomName },
        data: { recordingUrl, endedAt: new Date() },
      });
      return json({ ok: true, sessionId: updated.id, recordingUrl });
    } catch (e: any) {
      return json({ ok: false, error: e?.message ?? String(e) }, 500);
    }
  }

  // If it's a room end without URL, we can still mark ended
  if (payload?.event === 'room_finished' || payload?.type === 'room_finished') {
    try {
      const updated = await prisma.codeCrySession.update({ where: { roomName }, data: { endedAt: new Date() } });
      return json({ ok: true, sessionId: updated.id, ended: true });
    } catch (e: any) {
      return json({ ok: false, error: e?.message ?? String(e) }, 500);
    }
  }

  return json({ ok: true, ignored: true });
}
