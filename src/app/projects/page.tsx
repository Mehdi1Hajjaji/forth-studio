import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/layout/PageIntro";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { fetchProjectSummaries } from "@/lib/data";

export const metadata: Metadata = {
  title: "Projects - forth.studio",
  description:
    "Showcase board for campus developers: publish builds, gather feedback, and connect with collaborators.",
};

export default async function ProjectsPage() {
  const projects = await fetchProjectSummaries();

  return (
    <PageWrapper>
      <PageIntro
        eyebrow="Portfolios"
        title="Projects built by university engineers"
        description="Students across the network ship tools, research prototypes, and creative experiments. Explore their work and drop constructive feedback."
        actions={
          <>
            <Link
              href="/auth/sign-in"
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:text-white"
            >
              Request feedback
            </Link>
            <Link
              href="/auth/sign-in"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:-translate-y-0.5 hover:bg-indigo-500"
            >
              Publish a project
            </Link>
          </>
        }
      />

      <section className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <article
            key={project.slug}
            className="group flex flex-col justify-between rounded-3xl border border-white/5 bg-surface/60 p-6 transition hover:-translate-y-1 hover:border-accent/30 hover:shadow-card"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/55">
                <span>{project.status}</span>
                <span>{project.feedbackCount} feedback</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-white">
                  {project.title}
                </h2>
                <p className="text-sm text-white/65">{project.summary}</p>
              </div>
              <div className="text-xs text-white/50">
                {project.author} | {project.university}
              </div>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <Link
                href={`/projects/${project.slug}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-white"
              >
                View case study
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <button
                type="button"
                className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white/70 transition hover:border-accent/40 hover:text-white"
              >
                Support
              </button>
            </div>
          </article>
        ))}
        {!projects.length ? (
          <p className="rounded-3xl border border-white/5 bg-white/5 p-6 text-sm text-white/60">
            No public projects yet. Publish a build to see it featured here.
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
export const dynamic = 'force-dynamic';
