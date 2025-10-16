import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/layout/PageIntro";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { fetchProblemList } from "@/lib/data";

const tracks = [
  "All",
  "Beginner",
  "Intermediate",
  "Advanced",
  "Graph Theory",
  "Dynamic Programming",
];

export const metadata: Metadata = {
  title: "Algorithms - forth.studio",
  description:
    "Browse curated algorithm challenges tailored for university students. Filter by difficulty, topic, or campus to find your next practice task.",
};

export default async function AlgorithmsPage() {
  let problems = [] as Awaited<ReturnType<typeof fetchProblemList>>;
  try {
    problems = await fetchProblemList();
  } catch (err) {
    problems = [];
  }

  return (
    <PageWrapper>
      <PageIntro
        eyebrow="Daily practice"
        title="Explore algorithm challenges curated by the campus network"
        description="Every challenge is reviewed by student mentors and industry alumni. Track your progress, collaborate in squads, and level up with feedback loops tuned for university life."
        actions={
          <>
            <Link
              href="/auth/sign-in"
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:text-white"
            >
              View my streak
            </Link>
            <Link
              href="#filters"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:-translate-y-0.5 hover:bg-indigo-500"
            >
              Suggest a challenge
            </Link>
          </>
        }
      />

      <section className="mt-12 space-y-6">
        <div
          id="filters"
          className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/5 bg-surface/70 px-6 py-4"
        >
          {tracks.map((track) => (
            <button
              key={track}
              type="button"
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest transition ${
                track === "All"
                  ? "bg-accent text-accent-foreground"
                  : "border border-white/10 text-white/70 hover:border-accent/40 hover:text-white"
              }`}
            >
              {track}
            </button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {problems.map((problem) => {
            const updatedLabel = new Date(problem.updatedAt).toLocaleDateString();
            return (
            <article
              key={problem.slug}
              className="group flex flex-col justify-between rounded-3xl border border-white/5 bg-surface/60 p-6 transition hover:-translate-y-1 hover:border-accent/30 hover:shadow-card"
            >
              <div className="space-y-5">
                <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-accent">
                  <span>{problem.difficulty}</span>
                  <span className="h-px w-8 bg-white/15" />
                  <span>{problem.university}</span>
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-white">
                    {problem.title}
                  </h2>
                  <p className="text-sm text-white/65">{problem.summary}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {problem.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs text-white/50">
                <p>
                  {problem.solved} students solved | Updated {updatedLabel}
                </p>
                <Link
                  href={`/algorithms/${problem.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-white"
                >
                  Preview
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </article>
          );})}
        </div>
      </section>
    </PageWrapper>
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
