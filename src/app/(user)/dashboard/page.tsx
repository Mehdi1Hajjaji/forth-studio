import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ForthHero } from "@/components/visuals/ForthHero";
import { SplashIntro } from "@/components/motion/SplashIntro";
import { fetchBestSubmissions, fetchDashboardData } from "@/lib/data";
import { GlowingCarousel } from "@/components/visuals/GlowingCarousel";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import CodeCryCreateForm from "./CodeCryCreateForm";

export default async function DashboardPage() {
  let nextProblem: any = null;
  let stats: any = { solvedCount: 0, weeklySubmissions: 0, feedbackCount: 0 };
  let draftStory: any = null;
  let latestProject: any = null;
  let featuredStory: any = null;
  let topSubmission: any = null;
  let bestSubmissions: any[] = [];

  try {
    const [d, subs] = await Promise.all([
      fetchDashboardData(),
      fetchBestSubmissions(1),
    ]);
    nextProblem = d.nextProblem;
    stats = d.stats;
    draftStory = d.draftStory;
    latestProject = d.latestProject;
    featuredStory = d.featuredStory;
    topSubmission = d.topSubmission;
    bestSubmissions = subs;
  } catch (err) {
    // graceful fallback
  }

  const primarySubmission = topSubmission ?? bestSubmissions[0] ?? null;
  const viewer = await getCurrentUser();
  const mySessions = viewer?.id
    ? await (prisma as any).codeCrySession.findMany({ where: { hostId: viewer.id }, orderBy: [{ scheduledFor: 'asc' }, { createdAt: 'desc' }], take: 5 })
    : [];

  return (
    <DashboardShell
      title="Studio dashboard"
      description="Track your streak, drafts, and community feedback from one place."
      activePath="/dashboard"
      hero={<ForthHero />}
      actions={
        <Link
          href="/submit"
          className="pill-button pill-button--primary text-sm"
        >
          Resume latest attempt
        </Link>
      }
    >
      <SplashIntro imageSrc="/splash.jpg" />
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Solved challenges"
          value={`${stats.solvedCount}`}
          description="Total accepted solutions registered across forth.studio."
        />
        <StatCard
          title="This week"
          value={`${stats.weeklySubmissions} submissions`}
          description="Keep a 7-day streak to unlock mentor review credits."
        />
        <StatCard
          title="Feedback received"
          value={`${stats.feedbackCount} notes`}
          description="Mentors and peers who reviewed your projects recently."
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
        <article className="surface-card surface-card--muted space-y-4 rounded-[28px] p-6 shadow-card-soft">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Code & Cry</p>
              <h2 className="text-xl font-semibold text-foreground">Live co-coding sessions</h2>
            </div>
            <Link href="/code-cry" className="text-sm font-semibold text-accent hover:text-foreground">Browse</Link>
          </header>
          <div className="space-y-3">
            {mySessions.length === 0 ? (
              <p className="text-sm text-muted">Create your first session and invite the community to help you debug in real time.</p>
            ) : (
              <ul className="space-y-2">
                {(mySessions as any[]).map((s: any) => (
                  <li key={s.id} className="flex items-center justify-between rounded-xl border border-border/45 bg-surface/80 px-3 py-2 text-sm">
                    <div>
                      <div className="font-medium">{s.title}</div>
                      {s.scheduledFor && <div className="text-xs text-muted">{new Date(s.scheduledFor).toLocaleString()}</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={`/code-cry/session/${s.id}`} className="rounded border px-3 py-1 hover:bg-muted">Open</a>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </article>
        <aside className="surface-card surface-card--muted space-y-4 rounded-[28px] p-6 shadow-card-soft">
          <CodeCryCreateForm />
        </aside>
      </section>

      <GlowingCarousel
        items={[
          {
            title: "Student Success Stories",
            description:
              "Weekly wins and problem write-ups curated from across the network.",
            badge: "Featured",
          },
          {
            title: "Interview Prep",
            description: "Handpicked DS&A questions with clean solution patterns.",
            badge: "New",
          },
          {
            title: "Open Source Projects",
            description: "Find teams looking for contributors and ship PRs.",
          },
          {
            title: "Recruitment Board",
            description: "Internships and early roles from community partners.",
          },
          {
            title: "Campus Leaderboard",
            description: "Track streaks and climb with your chapter.",
          },
        ]}
      />

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
        <article className="surface-card surface-card--muted space-y-4 rounded-[28px] p-6 shadow-card-soft">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                Next algorithm
              </p>
              <h2 className="text-xl font-semibold text-foreground">
                {nextProblem?.title ?? "New challenges incoming"}
              </h2>
            </div>
            {nextProblem ? (
              <span className="rounded-full border border-border/45 bg-surface/75 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted">
                {nextProblem.difficulty}
              </span>
            ) : null}
          </header>
          <p className="text-sm text-muted">
            {nextProblem?.summary ??
              "Fresh algorithm challenges will appear here once your chapter publishes the next batch."}
          </p>
          {nextProblem ? (
            <>
              <div className="flex flex-wrap gap-2">
                {nextProblem.tags.map((t: any) => (
                  <span
                    key={t.tag.id}
                    className="rounded-full border border-border/45 bg-surface/80 px-3 py-1 text-xs font-medium text-muted"
                  >
                    #{t.tag.name}
                  </span>
                ))}
              </div>
              <Link
                href={`/algorithms/${nextProblem.slug}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:text-foreground"
              >
                View problem brief
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </>
          ) : null}
        </article>

        <aside className="surface-card surface-card--muted space-y-4 rounded-[28px] p-6 shadow-card-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Quick actions
          </p>
          <div className="space-y-3 text-sm text-muted">
            {viewer && (viewer as any).username ? (
              <Link
                href={`/profile/${(viewer as any).username}`}
                className="block rounded-2xl border border-border/45 bg-surface/80 px-4 py-3 font-semibold text-foreground transition hover:border-accent/40 hover:text-accent"
              >
                View my galaxy profile
              </Link>
            ) : null}
            <Link
              href="/stories/new"
              className="block rounded-2xl border border-border/45 bg-surface/80 px-4 py-3 font-semibold text-foreground transition hover:border-accent/40 hover:text-accent"
            >
              {draftStory ? "Resume story draft" : "Start a new story"}
            </Link>
            <Link
              href="/projects/new"
              className="block rounded-2xl border border-border/45 bg-surface/80 px-4 py-3 font-semibold text-foreground transition hover:border-accent/40 hover:text-accent"
            >
              {latestProject ? "Update project milestone" : "Publish a project"}
            </Link>
            <Link
              href="/submit"
              className="block rounded-2xl border border-border/45 bg-surface/80 px-4 py-3 font-semibold text-foreground transition hover:border-accent/40 hover:text-accent"
            >
              Review submission feedback
            </Link>
          </div>
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="surface-card surface-card--muted rounded-[28px] p-6 shadow-card-soft">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                Featured story
              </p>
              <h3 className="text-lg font-semibold text-foreground">
                {featuredStory?.title ?? "Share your perspective"}
              </h3>
            </div>
            {featuredStory ? (
              <span className="rounded-full border border-border/45 bg-surface/80 px-3 py-1 text-xs text-muted">
                {featuredStory.body.split(/\s+/).length / 200 < 1
                  ? "3 min read"
                  : `${Math.round(
                      featuredStory.body.split(/\s+/).length / 200,
                    )} min read`}
              </span>
            ) : null}
          </header>
          <p className="mt-3 text-sm text-muted">
            {featuredStory?.excerpt ??
              "Publish a story about your campus experience and we will highlight it here for the network to learn from."}
          </p>
          {featuredStory ? (
            <Link
              href={`/stories/${featuredStory.slug}`}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:text-foreground"
            >
              Read full story
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href="/stories/new"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:text-foreground"
            >
              Write a story
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          )}
        </article>
        <article className="surface-card surface-card--muted rounded-[28px] p-6 shadow-card-soft">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                Top solution
              </p>
              <h3 className="text-lg font-semibold text-foreground">
                {primarySubmission && "problem" in primarySubmission
                  ? primarySubmission.problem.title
                  : "Solve a challenge to be featured"}
              </h3>
            </div>
            {primarySubmission ? (
              <span className="rounded-full border border-border/45 bg-surface/80 px-3 py-1 text-xs text-muted">
                {primarySubmission.language}
              </span>
            ) : null}
          </header>
          <p className="mt-3 text-sm text-muted">
            {(primarySubmission && "reviewerNote" in primarySubmission && primarySubmission.reviewerNote) ??
              "Once your submission receives mentor feedback, we'll surface the highlights here."}
          </p>
          {primarySubmission ? (
            <Link
              href={`/best-solutions/${primarySubmission.id}`}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:text-foreground"
            >
              Study write-up
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href="/submit"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:text-foreground"
            >
              Submit a solution
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          )}
        </article>
      </section>
    </DashboardShell>
  );
}

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="surface-card rounded-[28px] p-6 shadow-card-soft">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">
        {title}
      </p>
      <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
      <p className="mt-2 text-sm text-muted">{description}</p>
    </div>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}
export const dynamic = 'force-dynamic';

