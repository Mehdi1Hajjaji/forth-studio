import Link from 'next/link';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Code & Cry main page
 * - Lists upcoming, live, and recent sessions
 * - CTA to subscribe/join
 */
export default async function CodeCryPage() {
  const [live, upcoming, past] = await Promise.all([
    prisma.codeCrySession.findMany({
      where: { startedAt: { not: null }, endedAt: null },
      orderBy: { startedAt: 'desc' },
      take: 3,
    }),
    prisma.codeCrySession.findMany({
      where: { startedAt: null, scheduledFor: { gt: new Date() } },
      orderBy: { scheduledFor: 'asc' },
      take: 5,
    }),
    prisma.codeCrySession.findMany({
      where: { endedAt: { not: null } },
      orderBy: [{ endedAt: 'desc' }, { startedAt: 'desc' }],
      take: 5,
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Code & Cry Sessions</h1>
        <p className="text-muted-foreground">
          Live, unfiltered co-coding. Get unstuck together. Join as yourself or anonymous.
        </p>
      </header>

      {live.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Live Now</h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {live.map((s) => (
              <li key={s.id} className="rounded border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{s.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{s.description}</p>
                  </div>
                  <Link href={`/code-cry/session/${s.id}`} className="inline-flex items-center rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700">
                    Join
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold mb-3">Upcoming</h2>
        <ul className="space-y-2">
          {upcoming.length === 0 && (
            <li className="text-sm text-muted-foreground">No sessions scheduled. Check back soon.</li>
          )}
          {upcoming.map((s) => (
            <li key={s.id} className="flex items-center justify-between border-b py-2">
              <div>
                <p className="font-medium">{s.title}</p>
                {s.scheduledFor && (
                  <p className="text-sm text-muted-foreground">{new Date(s.scheduledFor).toLocaleString()}</p>
                )}
              </div>
              <Link href={`/code-cry/session/${s.id}`} className="text-blue-600 hover:underline">Details</Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Recent</h2>
        <ul className="grid gap-3 md:grid-cols-2">
          {past.map((s) => (
            <li key={s.id} className="rounded border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{s.title}</h3>
                  {s.recordingUrl ? (
                    <a href={s.recordingUrl} target="_blank" className="text-sm text-blue-600 hover:underline">Watch recording</a>
                  ) : (
                    <p className="text-sm text-muted-foreground">No recording available</p>
                  )}
                </div>
                <Link href={`/code-cry/session/${s.id}`} className="text-blue-600 hover:underline">Highlights</Link>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

