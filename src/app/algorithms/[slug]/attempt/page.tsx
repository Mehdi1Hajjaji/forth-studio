import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { fetchProblemDetail } from "@/lib/data";

const languages = ["TypeScript", "Python", "C++", "Java", "Go", "Rust"];
const executionModes = ["Default tests", "Custom input"];

type Params = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const detail = await fetchProblemDetail(params.slug);

  if (!detail) {
    return {
      title: "Attempt - forth.studio",
    };
  }

  return {
    title: `Attempt ${detail.problem.title} - forth.studio`,
    description: `Workspace for ${detail.problem.title}`,
  };
}

export default async function AlgorithmAttemptPage({ params }: Params) {
  const detail = await fetchProblemDetail(params.slug);

  if (!detail) {
    notFound();
  }

  const { problem, sample } = detail;

  return (
    <PageWrapper inset>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            Attempt workspace
          </p>
          <h1 className="text-2xl font-semibold text-white">{problem.title}</h1>
          <p className="text-sm text-white/60">{problem.summary}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/algorithms/${params.slug}`}
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 transition hover:text-white"
          >
            View problem statement
          </Link>
          <Link
            href="/auth/sign-in"
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:-translate-y-0.5 hover:bg-indigo-500"
          >
            Save draft
          </Link>
        </div>
      </div>

      <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,3fr),minmax(0,2fr)]">
        <div className="space-y-4 rounded-3xl border border-white/5 bg-white/5 p-6">
          <div className="grid gap-4 md:grid-cols-[1fr,180px,180px]">
            <Field label="Language" htmlFor="language">
              <select id="language" name="language" className="auth-input">
                {languages.map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Execution mode" htmlFor="mode">
              <select id="mode" name="mode" className="auth-input">
                {executionModes.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Time limit" htmlFor="time-limit">
              <input
                id="time-limit"
                name="time-limit"
                className="auth-input"
                value="250 ms"
                readOnly
              />
            </Field>
          </div>
          <div>
            <label
              htmlFor="code"
              className="mb-2 block text-sm font-semibold text-white/70"
            >
              Code editor
            </label>
            <textarea
              id="code"
              name="code"
              rows={20}
              className="auth-input font-mono text-xs leading-relaxed"
              placeholder="// Write your solution here"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground transition hover:-translate-y-0.5 hover:bg-indigo-500"
            >
              Run tests
            </button>
            <button
              type="button"
              className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white/80 transition hover:text-white"
            >
              Submit for review
            </button>
          </div>
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-white/5 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">Sample input</h2>
            {sample ? (
              <>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
                  Input
                </p>
                <pre className="mt-2 max-h-48 overflow-auto rounded-xl border border-white/10 bg-black/40 p-3 text-xs leading-relaxed text-white/80">
                  <code>{sample.input}</code>
                </pre>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
                  Output
                </p>
                <pre className="mt-2 max-h-32 overflow-auto rounded-xl border border-white/10 bg-black/40 p-3 text-xs leading-relaxed text-white/80">
                  <code>{sample.output}</code>
                </pre>
              </>
            ) : (
              <p className="mt-3 text-sm text-white/60">
                Sample test case will be published soon.
              </p>
            )}
          </section>

          <section className="rounded-3xl border border-white/5 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">Mentor hints</h2>
            <ul className="mt-3 space-y-3 text-sm text-white/65">
              <li>
                Reuse a priority queue instead of sorting edges on every
                iteration.
              </li>
              <li>
                Guard against integer overflow when distances exceed 32-bit
                range.
              </li>
              <li>
                Annotate your code with a short note on complexity to help
                reviewers.
              </li>
            </ul>
          </section>

          <section className="rounded-3xl border border-white/5 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">Attempt history</h2>
            <p className="mt-3 text-sm text-white/60">
              Historical submissions will appear here once you sign in and start
              coding.
            </p>
          </section>
        </aside>
      </section>
    </PageWrapper>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="text-sm font-semibold text-white/70 transition hover:text-white"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
