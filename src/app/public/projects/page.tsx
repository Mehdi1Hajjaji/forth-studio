import Link from "next/link";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { fetchProjectSummaries } from "@/lib/data";

export default async function PublicProjectsPage() {
  const projects = await fetchProjectSummaries();
  return (
    <PageWrapper>
      <header className="space-y-4 rounded-3xl border border-white/5 bg-surface/70 p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
          Build in public
        </p>
        <h1 className="text-3xl font-semibold text-white">
          Projects shared by forth.studio creators
        </h1>
        <p className="text-sm text-white/65 sm:text-base">
          These case studies highlight what students are shipping-from AI tools to accessibility hardware. Sign in to follow or leave feedback.
        </p>
      </header>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        {projects.map((project) => (
          <article
            key={project.slug}
            className="rounded-3xl border border-white/10 bg-white/5 p-6"
          >
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/55">
              <span>{project.status}</span>
              <span>{project.feedbackCount} feedback</span>
            </div>
            <h2 className="mt-3 text-xl font-semibold text-white">
              {project.title}
            </h2>
            <p className="mt-2 text-sm text-white/65">{project.summary}</p>
            <p className="mt-3 text-xs text-white/50">
              {project.author} | {project.university}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <Link
              href={`/projects/${project.slug}`}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-white"
            >
              Read case study
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </article>
        ))}
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
