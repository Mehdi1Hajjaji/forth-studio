export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dns from 'node:dns/promises';
import net from 'node:net';

function parseDbUrl(url?: string) {
  try {
    if (!url) return null;
    const u = new URL(url);
    return {
      host: u.hostname,
      port: Number(u.port || 5432),
      sslmode: u.searchParams.get('sslmode') ?? undefined,
      protocol: u.protocol.replace(':', ''),
    };
  } catch {
    return null;
  }
}

async function resolveHost(host: string) {
  try {
    const [v4, v6] = await Promise.allSettled([dns.resolve4(host), dns.resolve6(host)]);
    return {
      v4: v4.status === 'fulfilled' ? v4.value : [],
      v6: v6.status === 'fulfilled' ? v6.value : [],
    };
  } catch (e: any) {
    return { error: e?.message ?? String(e) };
  }
}

function tcpProbe(host: string, port: number, timeoutMs = 3000): Promise<{ ok: boolean; error?: string; elapsedMs: number }>{
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = net.createConnection({ host, port });
    const done = (ok: boolean, error?: string) => {
      try { socket.destroy(); } catch {}
      resolve({ ok, error, elapsedMs: Date.now() - start });
    };
    socket.once('connect', () => done(true));
    socket.once('error', (err) => done(false, err?.message ?? String(err)));
    socket.setTimeout(timeoutMs, () => done(false, 'timeout'));
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const host = searchParams.get('host');
  const portStr = searchParams.get('port');
  const port = portStr ? Number(portStr) : undefined;

  const fallback = parseDbUrl(process.env.DATABASE_URL ?? undefined);
  const targetHost = host ?? fallback?.host;
  const targetPort = port ?? fallback?.port ?? 5432;

  if (!targetHost) {
    return NextResponse.json({ error: 'Provide ?host and optional ?port, or set DATABASE_URL' }, { status: 400 });
  }

  const dnsInfo = await resolveHost(targetHost);
  const tcpInfo = await tcpProbe(targetHost, targetPort);

  return NextResponse.json({
    target: { host: targetHost, port: targetPort },
    dns: dnsInfo,
    tcp: tcpInfo,
    hint: 'If tcp.ok is false, check Supabase host/port, project status, IP allowlist, and Vercel region/egress.',
  });
}

