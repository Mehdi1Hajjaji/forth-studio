import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageWrapper } from '@/components/layout/PageWrapper';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import Link from 'next/link';
import { badgesForUser } from '@/lib/profile-ui';
import { deriveGalaxyTheme } from '@/lib/galaxy-theme';
import GalaxyCover from './GalaxyCover';
import GiveKarmaButton from './GiveKarmaButton';

type Params = { params: { username: string } };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const user = await prisma.user.findUnique({ where: { username: params.username.toLowerCase() }, select: { name: true, username: true, bio: true } });
  if (!user) return { title: 'Profile - forth.studio' };
  return { title: `${user.name ?? user.username} – Profile` , description: user.bio ?? undefined };
}

export default async function ProfilePage({ params }: Params) {
  const viewer = await getCurrentUser();
  const user = await prisma.user.findUnique({
    where: { username: params.username.toLowerCase() },
    include: {
      stories: { where: { status: 'PUBLISHED' as any }, select: { slug: true, title: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 5 },
      submissions: { where: { status: 'PASSED' as any }, select: { id: true, createdAt: true, language: true, problem: { select: { slug: true, title: true } } }, orderBy: { createdAt: 'desc' }, take: 12 },
    },
  });
  if (!user) notFound();

  const isOwner = viewer?.id === user.id;
  let karmaTotal = 0;
  let karmaReceived: any[] = [];
  try {
    karmaTotal = await (prisma as any).userKarma.count({ where: { recipientId: user.id } });
    karmaReceived = isOwner
      ? await (prisma as any).userKarma.findMany({ where: { recipientId: user.id }, include: { sender: { select: { username: true, name: true } } }, orderBy: { createdAt: 'desc' }, take: 20 })
      : [];
  } catch {
    // Karma not enabled/migrated — fall back silently
    karmaTotal = 0;
    karmaReceived = [];
  }
  const [failPosts, sessions] = await Promise.all([
    (prisma as any).failPost.findMany({ where: { userId: user.id }, select: { id: true, projectAttempt: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 5 }),
    (prisma as any).codeCrySession.findMany({ where: { hostId: user.id }, select: { id: true, title: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 5 }),
  ]);
  const badges = badgesForUser(user as any);
  // Language affinity from recent solved submissions
  const langCounts: Record<string, number> = {};
  for (const s of user.submissions) {
    const key = (s.language || '').toLowerCase();
    if (!key) continue;
    langCounts[key] = (langCounts[key] ?? 0) + 1;
  }
  // Simple activity score (last 7 days)
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [recentSubs, recentStories, recentFails, recentSessions] = await Promise.all([
    prisma.submission.count({ where: { userId: user.id, createdAt: { gte: since } } }),
    prisma.story.count({ where: { authorId: user.id, updatedAt: { gte: since } } }),
    (prisma as any).failPost.count({ where: { userId: user.id, createdAt: { gte: since } } }).catch(() => 0),
    (prisma as any).codeCrySession.count({ where: { hostId: user.id, createdAt: { gte: since } } }).catch(() => 0),
  ]);
  const recentActivityScore = recentSubs + recentStories + recentFails + recentSessions;
  const theme = deriveGalaxyTheme({
    languages: langCounts,
    xp: (user as any).xp ?? 0,
    resilienceBadgeCount: (user as any).resilienceBadgeCount ?? 0,
    karma: karmaTotal,
    recentActivityScore,
  });
  const explain: string[] = [];
  const topLang = Object.keys(langCounts).sort((a,b) => (langCounts[b]??0)-(langCounts[a]??0))[0];
  if (topLang) explain.push(`Primary language signal: ${topLang} (${langCounts[topLang]} recent solves)`);
  if ((user as any).xp) explain.push(`XP: ${(user as any).xp}`);
  if ((user as any).resilienceBadgeCount) explain.push(`Resilience badges: ${(user as any).resilienceBadgeCount}`);
  if (karmaTotal) explain.push(`Karma: ${karmaTotal}`);
  if (recentActivityScore) explain.push(`Recent activity score: ${recentActivityScore}`);

  return (
    <PageWrapper inset>
      <section className="space-y-8 rounded-3xl border border-white/5 bg-surface/70 p-0">
        <GalaxyCover config={theme} explanation={explain.length ? explain : ["Galaxy generated from your coding signals."]} />
        <header className="flex flex-wrap items-center justify-between gap-4 p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">forth.studio member</p>
            <h1 className="text-3xl font-semibold text-white">{user.name ?? user.username} <span className="text-white/50 text-base">@{user.username}</span></h1>
            <p className="text-sm text-white/60">{user.pronouns ? `${user.pronouns} · ` : ''}Joined {user.createdAt.toLocaleDateString()}</p>
            {user.bio ? <p className="mt-3 text-sm text-white/70">{user.bio}</p> : null}
            {badges.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {badges.map((b) => (
                  <span key={b} className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-foreground">{b}</span>
                ))}
              </div>
            ) : null}
          </div>
          <GiveKarmaButton username={user.username} signedIn={Boolean(viewer)} isOwner={isOwner} initialTotal={karmaTotal} />
        </header>

        <div className="grid gap-6 p-8 md:grid-cols-2 lg:grid-cols-3">
          <ProfileCard title="Stories" items={user.stories.map(s => ({ href: `/stories/${s.slug}`, title: s.title, date: s.createdAt }))} empty="No published stories yet." />
          <ProfileCard title="Solved challenges" items={user.submissions.map(s => ({ href: `/best-solutions/${s.id}`, title: s.problem.title, date: s.createdAt }))} empty="No solved challenges yet." />
          <ProfileCard title="Fail Wall" items={failPosts.map((p: any) => ({ href: `/fail-wall`, title: p.projectAttempt, date: p.createdAt }))} empty="No Fail Wall posts yet." />
          <ProfileCard title="Code & Cry sessions" items={sessions.map((s: any) => ({ href: `/code-cry/session/${s.id}`, title: s.title, date: s.createdAt }))} empty="No sessions hosted yet." />
        </div>

        {isOwner ? (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">Karma received</h2>
            <ul className="mt-4 space-y-3 text-sm text-white/80">
              {karmaReceived.length === 0 && <li className="text-white/50">No karma yet. Keep helping the community!</li>}
              {karmaReceived.map(k => (
                <li key={k.id} className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                  <div>
                    <p className="font-medium">{k.sender?.name ?? k.sender?.username ?? 'Anonymous'}</p>
                    <p className="text-white/70">{k.reason}</p>
                  </div>
                  <span className="text-xs text-white/50">{new Date(k.createdAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <footer className="flex items-center justify-between text-sm text-white/60">
          <Link href="/" className="hover:text-white">Back home</Link>
          {isOwner && <Link href="/settings" className="hover:text-white">Edit profile</Link>}
        </footer>
      </section>
    </PageWrapper>
  );
}

function ProfileCard({ title, items, empty }: { title: string; items: { href: string; title: string; date: Date }[]; empty: string }) {
  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <ul className="space-y-2 text-sm text-white/80">
        {items.length === 0 && <li className="text-white/50">{empty}</li>}
        {items.map((it) => (
          <li key={it.href} className="flex items-center justify-between gap-3">
            <Link href={it.href} className="hover:text-white">{it.title}</Link>
            <span className="text-xs text-white/50">{it.date.toLocaleDateString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const dynamic = 'force-dynamic';
