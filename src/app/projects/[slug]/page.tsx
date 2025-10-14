import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { fetchProjectDetail } from "@/lib/data";

type ProjectParams = {
  params: { slug: string };
};

export async function generateMetadata({
  params,
}: ProjectParams): Promise<Metadata> {
  const project = await fetchProjectDetail(params.slug);

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

export default async function ProjectDetailPage({ params }: ProjectParams) {
  const project = await fetchProjectDetail(params.slug);

  if (!project) {
    notFound();
  }

  const links = [
    project.repoUrl ? { label: "GitHub", href: project.repoUrl } : null,
    project.demoUrl ? { label: "Live demo", href: project.demoUrl } : null,
  ].filter(
    (link): link is { label: string; href: string } => link !== null,
  );

  return (
    <PageWrapper inset>
      <article className="space-y-8 rounded-3xl border border-white/5 bg-surface/70 p-10 backdrop-blur">
        <header className="space-y-4 border-b border-white/10 pb-6">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to projects
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                {project.status} | {project.university?.name ?? "forth.studio"}
              </p>
              <h1 className="text-3xl font-semibold text-white">
                {project.title}
              </h1>
              <p className="text-sm text-white/60">
                Led by {project.owner.name ?? project.owner.username}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-accent hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </header>

        <p className="text-base leading-relaxed text-white/70">
          {project.description}
        </p>

        <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">Goals</h2>
          <ul className="space-y-2 text-sm text-white/65">
            {project.tags.map(({ tag }) => (
              <li key={tag.id} className="flex gap-3">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent" />
                <span>{tag.name}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">Latest comments</h2>
          <ul className="space-y-3 text-sm text-white/65">
            {project.comments.length ? (
              project.comments.map((comment) => (
                <li
                  key={comment.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                    {comment.author.name ?? comment.author.username}
                  </p>
                  <p className="mt-2 text-sm text-white/65">{comment.body}</p>
                </li>
              ))
            ) : (
              <li className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/60">
                No comments yet. Be the first to leave feedback.
              </li>
            )}
          </ul>
        </section>

        <footer className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/65">
          <p className="font-semibold text-white">Offer feedback</p>
          <p className="mt-2">
            Share suggestions, partnerships, or research leads. The team reviews
            every message within 48 hours.
          </p>
          <Link
            href="/auth/sign-in"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:-translate-y-0.5 hover:bg-indigo-500"
          >
            Send feedback
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
