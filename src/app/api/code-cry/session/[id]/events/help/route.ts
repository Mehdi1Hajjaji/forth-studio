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
          const reqs = await prisma.helpRequest.findMany({
            where: { sessionId: params.id, createdAt: { gt: last }, status: 'OPEN' as any },
            orderBy: { createdAt: 'asc' },
            take: 50,
          });
          for (const hr of reqs) {
            send({ type: 'help', data: hr });
            if (hr.createdAt > last) last = hr.createdAt;
          }
        } catch {}
        setTimeout(tick, 1500);
      }
      const ping = setInterval(() => controller.enqueue(encoder.encode(`: ping\n\n`)), 20000);
      tick();
      const cancel = () => { closed = true; clearInterval(ping); try { controller.close(); } catch {} };
      (request as any)?.signal?.addEventListener?.('abort', cancel);
    },
  });

  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive' } });
}
