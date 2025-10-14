import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { projectLibrary } from "@/lib/sample-data";

type Params = {
  params: { id: string };
};

export function generateMetadata({ params }: Params): Metadata {
  const project = projectLibrary[params.id];

  if (!project) {
    return {
      title: "Project not found - forth.studio",
    };
  }

  return {
    title: `${project.title} - forth.studio`,
    description: project.summary,
  };
}

export default function PublicProjectDetail({ params }: Params) {
  const project = projectLibrary[params.id];

  if (!project) {
    notFound();
  }

  return (
    <PageWrapper inset>
      <article className="space-y-8 rounded-3xl border border-white/5 bg-surface/70 p-10 backdrop-blur">
        <header className="space-y-3 border-b border-white/10 pb-6">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to projects
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              {project.status} | {project.university}
            </p>
            <h1 className="text-3xl font-semibold text-white">
              {project.title}
            </h1>
            <p className="text-sm text-white/60">Led by {project.author}</p>
          </div>
        </header>

        <p className="text-base leading-relaxed text-white/70">
          {project.summary}
        </p>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">Goals</h2>
          <ul className="mt-3 space-y-2 text-sm text-white/65">
            {project.goals.map((goal) => (
              <li key={goal} className="flex gap-3">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent" />
                <span>{goal}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">Milestones</h2>
          <ul className="space-y-3 text-sm text-white/65">
            {project.milestones.map((milestone) => (
              <li
                key={milestone.title}
                className="rounded-2xl border border-white/10 bg-black/20 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                  {milestone.date}
                </p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {milestone.title}
                </p>
                <p className="mt-2 text-sm text-white/65">
                  {milestone.description}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div>
            <p className="text-sm font-semibold text-white">
              Want to collaborate?
            </p>
            <p className="text-xs text-white/60">
              Sign in to message the team or leave detailed feedback.
            </p>
          </div>
          <Link
            href="/auth/sign-in"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:-translate-y-0.5 hover:bg-indigo-500"
          >
            Connect with team
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
