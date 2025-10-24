export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const encoder = new TextEncoder();
  let last = new Date(0);
  let closed = false;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (payload: any) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      async function tick() {
        if (closed) return;
        try {
          const s = await prisma.codeCrySession.findUnique({
            where: { id: params.id },
            select: { updatedAt: true, isChatClosed: true, isViewOnly: true, isStuck: true, startedAt: true, endedAt: true },
          });
          if (s && s.updatedAt > last) {
            last = s.updatedAt;
            const data = {
              isChatClosed: (s as any).isChatClosed ?? false,
              isViewOnly: (s as any).isViewOnly ?? false,
              isStuck: (s as any).isStuck ?? false,
              isLive: Boolean(s.startedAt && !s.endedAt),
              updatedAt: s.updatedAt,
            };
            send({ type: 'state', data });
          }
        } catch {}
        setTimeout(tick, 2000);
      }
      const ping = setInterval(() => controller.enqueue(encoder.encode(`: ping\n\n`)), 20000);
      tick();
      const cancel = () => { closed = true; clearInterval(ping); try { controller.close(); } catch {} };
      (request as any)?.signal?.addEventListener?.('abort', cancel);
    },
  });

  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive' } });
}
