export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createJoinToken } from '@/lib/livekit';

export async function GET() {
  const url = process.env.LIVEKIT_URL;
  const key = process.env.LIVEKIT_API_KEY;
  const secret = process.env.LIVEKIT_API_SECRET;
  if (!url || !key || !secret) {
    return NextResponse.json({ ok: false, error: 'Missing LiveKit env' }, { status: 500 });
  }
  try {
    // Attempt token creation to verify key/secret pairing works.
    await createJoinToken({ roomName: 'health-check', identity: 'health-check', name: 'Health', role: 'subscriber' });
    return NextResponse.json({ ok: true, url });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 });
  }
}

