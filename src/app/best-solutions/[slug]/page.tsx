import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { fetchSubmissionDetail } from "@/lib/data";

type SolutionParams = {
  params: { slug: string };
};

export async function generateMetadata({
  params,
}: SolutionParams): Promise<Metadata> {
  const submission = await fetchSubmissionDetail(params.slug);

  if (!submission) {
    return {
      title: "Solution not found - forth.studio",
    };
  }

  return {
    title: `${submission.problem.title} solution - forth.studio`,
    description: `${submission.user.name ?? submission.user.username} (${submission.user.university?.name ?? "forth.studio"}) — ${submission.language}`,
  };
}

export default async function SolutionDetailPage({ params }: SolutionParams) {
  const submission = await fetchSubmissionDetail(params.slug);

  if (!submission) {
    notFound();
  }

  return (
    <PageWrapper inset>
      <article className="space-y-8 rounded-3xl border border-white/5 bg-surface/70 p-10 backdrop-blur">
        <header className="space-y-4 border-b border-white/10 pb-6">
          <Link
            href="/best-solutions"
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to best solutions
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                {submission.language} | {submission.problem.title}
              </p>
              <h1 className="text-3xl font-semibold text-white">
                {submission.problem.title}
              </h1>
              <p className="text-sm text-white/60">
                By {submission.user.name ?? submission.user.username} at{" "}
                {submission.user.university?.name ?? "forth.studio"}
              </p>
            </div>
            <div className="rounded-full border border-accent/40 bg-accent/10 px-5 py-2 text-sm font-semibold text-accent">
              {submission.score ?? 0} upvotes
            </div>
          </div>
        </header>

        <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">Reviewer notes</h2>
          <p className="text-sm text-white/65">
            {submission.reviewerNote ??
              "Mentor feedback will appear here once reviewers leave notes."}
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-black/40 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">Core implementation</h2>
            <Link
              href="#"
              className="text-sm font-semibold text-accent hover:text-white"
            >
              Open full gist
            </Link>
          </div>
          <pre className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-black/60 p-4 text-xs leading-relaxed text-white/80">
            <code>{submission.code}</code>
          </pre>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div>
            <p className="text-sm font-semibold text-white">
              Want feedback on your own approach?
            </p>
            <p className="text-xs text-white/60">
              Submit your write-up and mentors will review it in under 48 hours.
            </p>
          </div>
          <Link
            href="/auth/sign-in"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:-translate-y-0.5 hover:bg-indigo-500"
          >
            Share my solution
          </Link>
        </footer>
      </article>
    </PageWrapper>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
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
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}
