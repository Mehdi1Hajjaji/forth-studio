import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { fetchProblemDetail } from "@/lib/data";

type AlgorithmsPageParams = {
  params: { slug: string };
};

export async function generateMetadata({
  params,
}: AlgorithmsPageParams): Promise<Metadata> {
  const detail = await fetchProblemDetail(params.slug);

  if (!detail) {
    return {
      title: "Algorithm not found - forth.studio",
    };
  }

  return {
    title: `${detail.problem.title} - forth.studio`,
    description: detail.problem.summary,
  };
}

export default async function AlgorithmDetailPage({
  params,
}: AlgorithmsPageParams) {
  const detail = await fetchProblemDetail(params.slug);

  if (!detail) {
    notFound();
  }

  const { problem, tags, sample, related } = detail;

  return (
    <PageWrapper inset>
      <div className="rounded-3xl border border-white/5 bg-surface/70 p-8 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              {problem.difficulty}
            </p>
            <h1 className="text-3xl font-semibold text-white">
              {problem.title}
            </h1>
            <p className="max-w-2xl text-sm text-white/65">
              {problem.summary}
            </p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end gap-3 text-sm text-white/60">
            <Link
              href={`/algorithms/${params.slug}/attempt`}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:-translate-y-0.5 hover:bg-indigo-500"
            >
              Open practice workspace
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <p>Peer reviews open | 18 mentors active</p>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
          <article className="space-y-6">
            <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold text-white">Problem statement</h2>
              <p className="whitespace-pre-line text-sm text-white/70">
                {problem.statement}
              </p>
            </section>

            <section className="grid gap-6 md:grid-cols-2">
              <SpecCard
                title="Input format"
                items={
                  problem.testcases.length > 0
                    ? ["See sample test case."]
                    : ["Input specification will be published soon."]
                }
              />
              <SpecCard
                title="Output format"
                items={
                  problem.testcases.length > 0
                    ? ["Return values as specified in the sample output."]
                    : ["Output specification will be published soon."]
                }
              />
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold text-white">Sample</h2>
              <div className="mt-4 grid gap-6 md:grid-cols-2">
                {sample ? (
                  <>
                    <CodeBlock label="Sample input" code={sample.input} />
                    <CodeBlock label="Expected output" code={sample.output} />
                  </>
                ) : (
                  <p className="col-span-2 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/60">
                    Sample test case will be published soon.
                  </p>
                )}
              </div>
            </section>

            <section
              id="workspace"
              className="space-y-4 rounded-2xl border border-accent/30 bg-accent/5 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Workspace preview
                  </h2>
                  <p className="text-sm text-white/60">
                    When you start an attempt, you will receive starter code,
                    hidden test cases, and hints from mentors.
                  </p>
                </div>
                <Link
                  href={`/algorithms/${params.slug}/attempt`}
                  className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-accent hover:border-accent/60 hover:text-white"
                >
                  Open workspace
                </Link>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-xs text-white/50">
                <p>Workspace area will host the collaborative editor</p>
                <p>Judges, hints, and feedback loops are in progress</p>
              </div>
            </section>
          </article>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
                Discussion board
              </h3>
              <p className="mt-3 text-sm text-white/65">
                Community threads will appear here once we launch the
                collaborative editor.
              </p>
              <Link
                href="#"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-white"
              >
                Join the conversation
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
                Related challenges
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-white/70">
                {related.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/algorithms/${item.slug}`}
                      className="text-white transition hover:text-accent"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
                {!related.length ? (
                  <li className="text-white/50">
                    More challenges coming soon.
                  </li>
                ) : null}
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </PageWrapper>
  );
}

function SpecCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <ul className="mt-3 space-y-2 text-sm text-white/65">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function CodeBlock({ label, code }: { label: string; code: string }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
        {label}
      </p>
      <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4 text-xs leading-relaxed text-white/80">
        <code>{code}</code>
      </pre>
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
