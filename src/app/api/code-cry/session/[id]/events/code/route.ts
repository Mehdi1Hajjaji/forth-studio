export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const encoder = new TextEncoder();
  let lastUpdatedAt = new Date(0);
  let closed = false;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (payload: any) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      async function tick() {
        if (closed) return;
        try {
          const s = await prisma.codeCrySession.findUnique({ where: { id: params.id }, select: { updatedAt: true, codeContent: true, codeLanguage: true } });
          if (s) {
            if (s.updatedAt > lastUpdatedAt) {
              lastUpdatedAt = s.updatedAt;
              send({ type: 'code', data: { content: (s as any).codeContent ?? '', language: (s as any).codeLanguage ?? 'plaintext', updatedAt: s.updatedAt } });
            }
          }
        } catch {}
        setTimeout(tick, 2000);
      }
      const ping = setInterval(() => controller.enqueue(encoder.encode(`: ping\n\n`)), 20000);
      tick();
      const cancel = () => { closed = true; clearInterval(ping); try { controller.close(); } catch {} };
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

