import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { fetchProblemDetail } from "@/lib/data";

type Params = {
  params: { slug: string };
};

export async function generateMetadata({
  params,
}: Params): Promise<Metadata> {
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

export default async function PublicAlgorithmDetail({ params }: Params) {
  const detail = await fetchProblemDetail(params.slug);

  if (!detail) {
    notFound();
  }

  const { problem, sample } = detail;

  return (
    <PageWrapper inset>
      <article className="space-y-8 rounded-3xl border border-white/5 bg-surface/70 p-10 backdrop-blur">
        <header className="space-y-3 border-b border-white/10 pb-6">
          <Link
            href="/algorithms"
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to algorithms
          </Link>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              {problem.difficulty}
            </p>
            <h1 className="text-3xl font-semibold text-white">
              {problem.title}
            </h1>
            <p className="text-sm text-white/65">{problem.summary}</p>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <SpecCard title="Input format" items={["See sample input below."]} />
          <SpecCard
            title="Output format"
            items={["Outputs should match the sample output."]}
          />
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">Problem statement</h2>
          <p className="mt-3 whitespace-pre-line text-sm text-white/70">
            {problem.statement}
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">Sample</h2>
          {sample ? (
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              <CodeBlock label="Input" code={sample.input} />
              <CodeBlock label="Output" code={sample.output} />
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/60">
              Sample test case will be published soon.
            </p>
          )}
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div>
            <p className="text-sm font-semibold text-white">
              Ready to submit a solution?
            </p>
            <p className="text-xs text-white/60">
              Create an account to get automated judging and peer feedback.
            </p>
          </div>
          <Link
            href="/auth/sign-in"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:-translate-y-0.5 hover:bg-indigo-500"
          >
            Sign in to attempt
          </Link>
        </footer>
      </article>
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
