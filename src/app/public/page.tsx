import Link from "next/link";
import { PageWrapper } from "@/components/layout/PageWrapper";
import {
  algorithmList,
  projectSummaries,
  storySummaries,
} from "@/lib/sample-data";

export default function PublicHubPage() {
  return (
    <PageWrapper>
      <section className="rounded-3xl border border-white/5 bg-surface/70 p-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
          Community spotlight
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-white">
          Discover what CS students are building right now
        </h1>
        <p className="mt-4 text-sm text-white/65 sm:text-base">
          forth.studio curates algorithm challenges, learning stories, and real
          projects from campus chapters around the world. Explore the latest
          highlights below.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link
            href="/algorithms"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:-translate-y-0.5 hover:bg-indigo-500"
          >
            Try a challenge
          </Link>
          <Link
            href="/stories"
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:text-white"
          >
            Read stories
          </Link>
        </div>
      </section>

      <section className="mt-12 space-y-4">
        <header className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">
            Trending algorithms
          </h2>
          <Link
            href="/algorithms"
            className="text-sm font-semibold text-accent hover:text-white"
          >
            Browse all
          </Link>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {algorithmList.slice(0, 4).map((problem) => (
            <article
              key={problem.slug}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                {problem.university}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">
                {problem.title}
              </h3>
              <p className="mt-2 text-sm text-white/65">{problem.summary}</p>
              <Link
                href={`/algorithms/${problem.slug}`}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-white"
              >
                View details
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12 space-y-4">
        <header className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">
            Campus stories
          </h2>
          <Link
            href="/stories"
            className="text-sm font-semibold text-accent hover:text-white"
          >
            See archive
          </Link>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {storySummaries.slice(0, 3).map((story) => (
            <article
              key={story.slug}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                {story.university} | {story.readingTime}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">
                {story.title}
              </h3>
              <p className="mt-2 text-sm text-white/65">{story.summary}</p>
              <Link
                href={`/stories/${story.slug}`}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-white"
              >
                Read story
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12 space-y-4">
        <header className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Live projects</h2>
          <Link
            href="/projects"
            className="text-sm font-semibold text-accent hover:text-white"
          >
            Explore projects
          </Link>
        </header>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projectSummaries.slice(0, 3).map((project) => (
            <article
              key={project.slug}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                {project.status} | {project.university}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">
                {project.title}
              </h3>
              <p className="mt-2 text-sm text-white/65">{project.summary}</p>
              <Link
                href={`/projects/${project.slug}`}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-white"
              >
                View case study
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </article>
          ))}
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
