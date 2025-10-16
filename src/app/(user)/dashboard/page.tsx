import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { fetchBestSubmissions, fetchDashboardData } from "@/lib/data";

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

  return (
    <DashboardShell
      title="Studio dashboard"
      description="Track your streak, drafts, and community feedback from one place."
      activePath="/dashboard"
      actions={
        <Link
          href="/submit"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:-translate-y-0.5 hover:bg-indigo-500"
        >
          Resume latest attempt
        </Link>
      }
    >
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
        <article className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                Next algorithm
              </p>
              <h2 className="text-xl font-semibold text-white">
                {nextProblem?.title ?? "New challenges incoming"}
              </h2>
            </div>
            {nextProblem ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/70">
                {nextProblem.difficulty}
              </span>
            ) : null}
          </header>
          <p className="text-sm text-white/65">
            {nextProblem?.summary ??
              "Fresh algorithm challenges will appear here once your chapter publishes the next batch."}
          </p>
          {nextProblem ? (
            <>
              <div className="flex flex-wrap gap-2">
                {nextProblem.tags.map((t: any) => (
                  <span
                    key={t.tag.id}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70"
                  >
                    #{t.tag.name}
                  </span>
                ))}
              </div>
              <Link
                href={`/algorithms/${nextProblem.slug}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-white"
              >
                View problem brief
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </>
          ) : null}
        </article>

        <aside className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
            Quick actions
          </p>
          <div className="space-y-3 text-sm text-white/70">
            <Link
              href="/stories/new"
              className="block rounded-xl border border-white/10 bg-surface/70 px-4 py-3 font-semibold text-white transition hover:border-accent/30 hover:text-accent"
            >
              {draftStory ? "Resume story draft" : "Start a new story"}
            </Link>
            <Link
              href="/projects/new"
              className="block rounded-xl border border-white/10 bg-surface/70 px-4 py-3 font-semibold text-white transition hover:border-accent/30 hover:text-accent"
            >
              {latestProject ? "Update project milestone" : "Publish a project"}
            </Link>
            <Link
              href="/submit"
              className="block rounded-xl border border-white/10 bg-surface/70 px-4 py-3 font-semibold text-white transition hover:border-accent/30 hover:text-accent"
            >
              Review submission feedback
            </Link>
          </div>
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                Featured story
              </p>
              <h3 className="text-lg font-semibold text-white">
                {featuredStory?.title ?? "Share your perspective"}
              </h3>
            </div>
            {featuredStory ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                {featuredStory.body.split(/\s+/).length / 200 < 1
                  ? "3 min read"
                  : `${Math.round(
                      featuredStory.body.split(/\s+/).length / 200,
                    )} min read`}
              </span>
            ) : null}
          </header>
          <p className="mt-3 text-sm text-white/65">
            {featuredStory?.excerpt ??
              "Publish a story about your campus experience and we will highlight it here for the network to learn from."}
          </p>
          {featuredStory ? (
            <Link
              href={`/stories/${featuredStory.slug}`}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-white"
            >
              Read full story
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href="/stories/new"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-white"
            >
              Write a story
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          )}
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                Top solution
              </p>
              <h3 className="text-lg font-semibold text-white">
                {primarySubmission && "problem" in primarySubmission
                  ? primarySubmission.problem.title
                  : "Solve a challenge to be featured"}
              </h3>
            </div>
            {primarySubmission ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                {primarySubmission.language}
              </span>
            ) : null}
          </header>
          <p className="mt-3 text-sm text-white/65">
            {(primarySubmission && "reviewerNote" in primarySubmission && primarySubmission.reviewerNote) ??
              "Once your submission receives mentor feedback, we'll surface the highlights here."}
          </p>
          {primarySubmission ? (
            <Link
              href={`/best-solutions/${primarySubmission.id}`}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-white"
            >
              Study write-up
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href="/submit"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-white"
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
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
        {title}
      </p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-white/60">{description}</p>
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

