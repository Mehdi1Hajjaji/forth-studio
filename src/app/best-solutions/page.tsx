import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/layout/PageIntro";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { fetchBestSubmissions } from "@/lib/data";

export const metadata: Metadata = {
  title: "Best solutions - forth.studio",
  description:
    "Curated submissions that wowed mentors: clean code, thoughtful write-ups, and community-first explanations.",
};

export default async function BestSolutionsPage() {
  const submissions = await fetchBestSubmissions();

  return (
    <PageWrapper>
      <PageIntro
        eyebrow="Community highlights"
        title="The best rated solutions this week"
        description="Mentors and peers nominate solutions for clarity, pedagogy, and performance. Browse them to reverse engineer winning techniques."
        actions={
          <Link
            href="/auth/sign-in"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:-translate-y-0.5 hover:bg-indigo-500"
          >
            Submit my solution
          </Link>
        }
      />

      <section className="mt-12 grid gap-6 md:grid-cols-2">
        {submissions.map((submission) => (
          <article
            key={submission.id}
            className="group rounded-3xl border border-white/5 bg-surface/60 p-6 transition hover:-translate-y-1 hover:border-accent/30 hover:shadow-card"
          >
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-white/55">
              <span>{submission.language}</span>
              <span>{submission.votes} upvotes</span>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-white">
              {submission.algorithm}
            </h2>
            <p className="mt-2 text-sm text-white/65">
              {submission.highlights}
            </p>
            <div className="mt-4 text-xs text-white/50">
              <p>
                By {submission.author} | {submission.university}
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <Link
                href={`/best-solutions/${submission.id}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-white"
              >
                View write-up
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <button
                type="button"
                className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white/70 transition hover:border-accent/40 hover:text-white"
              >
                Save
              </button>
            </div>
          </article>
        ))}
        {!submissions.length ? (
          <p className="rounded-3xl border border-white/5 bg-white/5 p-6 text-sm text-white/60">
            No highlighted submissions yet. Solve a challenge and tag mentors to
            be featured here.
          </p>
        ) : null}
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
