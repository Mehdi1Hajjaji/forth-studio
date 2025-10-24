export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(request.url);
  const initialSince = searchParams.get('since') ? new Date(searchParams.get('since')!) : null;
  const encoder = new TextEncoder();
  let last = initialSince ?? new Date(0);
  let isClosed = false;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const push = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      async function tick() {
        if (isClosed) return;
        try {
          const msgs = await prisma.chatMessage.findMany({
            where: { sessionId: params.id, sentAt: { gt: last } },
            orderBy: { sentAt: 'asc' },
            take: 50,
          });
          for (const m of msgs) {
            push({ type: 'message', data: m });
            if (m.sentAt > last) last = m.sentAt;
          }
        } catch {
          // ignore transient errors
        } finally {
          setTimeout(tick, 1500);
        }
      }

      // keep-alive
      const ping = setInterval(() => {
        controller.enqueue(encoder.encode(`: ping\n\n`));
      }, 20000);

      tick();

      const cancel = () => {
        isClosed = true;
        clearInterval(ping);
        try { controller.close(); } catch {}
      };

      // Abort handling
      const signal = (request as any).signal as AbortSignal | undefined;
      signal?.addEventListener('abort', cancel);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}

