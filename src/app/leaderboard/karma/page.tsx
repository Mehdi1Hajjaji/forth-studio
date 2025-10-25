import { PageWrapper } from '@/components/layout/PageWrapper';
import prisma from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function KarmaLeaderboardPage() {
  let rows: Array<{ recipientId: string; count: number }> = [];
  try {
    // Try official groupBy; if schema not migrated yet, this will throw
    // @ts-ignore prisma typing for groupBy orderBy count shortcut
    const grouped = await (prisma as any).userKarma.groupBy({
      by: ['recipientId'],
      _count: { _all: true },
      orderBy: { _count: { _all: 'desc' } },
      take: 10,
    });
    rows = grouped.map((g: any) => ({ recipientId: g.recipientId, count: g._count._all }));
  } catch {
    rows = [];
  }

  let users: Record<string, { username: string; name: string | null; avatarUrl: string | null }> = {};
  if (rows.length) {
    const ids = rows.map((r) => r.recipientId);
    const list = await prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, username: true, name: true, avatarUrl: true },
    });
    users = Object.fromEntries(list.map((u) => [u.id, { username: u.username, name: u.name, avatarUrl: u.avatarUrl }]));
  }

  return (
    <PageWrapper>
      <section className="space-y-6 rounded-3xl border border-white/5 bg-surface/70 p-8">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Community</p>
          <h1 className="text-3xl font-semibold text-white">Karma Leaderboard</h1>
          <p className="text-sm text-white/70">Top community members by Karma received.</p>
        </header>
        {rows.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">Leaderboard will appear once Karma is enabled and data is available.</p>
        ) : (
          <ol className="space-y-2">
            {rows.map((r, idx) => {
              const u = users[r.recipientId];
              if (!u) return null;
              return (
                <li key={r.recipientId} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-sm font-bold text-accent-foreground">{idx + 1}</span>
                    <Link href={`/profile/${u.username}`} className="font-semibold text-white hover:underline">{u.name ?? u.username}</Link>
                    <span className="text-xs text-white/50">@{u.username}</span>
                  </div>
                  <div className="text-sm text-white/80">{r.count} Karma</div>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </PageWrapper>
  );
}

