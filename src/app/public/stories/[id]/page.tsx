import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { storyLibrary } from "@/lib/sample-data";

type Params = {
  params: { id: string };
};

export function generateMetadata({ params }: Params): Metadata {
  const story = storyLibrary[params.id];

  if (!story) {
    return {
      title: "Story not found - forth.studio",
    };
  }

  return {
    title: `${story.title} - forth.studio`,
    description: `${story.author} (${story.university})`,
  };
}

export default function PublicStoryDetail({ params }: Params) {
  const story = storyLibrary[params.id];

  if (!story) {
    notFound();
  }

  return (
    <PageWrapper inset>
      <article className="space-y-8 rounded-3xl border border-white/5 bg-surface/70 p-10 backdrop-blur">
        <header className="space-y-3 border-b border-white/10 pb-6">
          <Link
            href="/stories"
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to stories
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              {story.university} | {story.readingTime}
            </p>
            <h1 className="text-3xl font-semibold text-white">
              {story.title}
            </h1>
            <p className="text-sm text-white/60">By {story.author}</p>
          </div>
        </header>

        <div className="space-y-5 text-base leading-relaxed text-white/70">
          {story.content.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div>
            <p className="text-sm font-semibold text-white">
              Want to publish your own journey?
            </p>
            <p className="text-xs text-white/60">
              Join forth.studio to collaborate with mentor editors before going
              live.
            </p>
          </div>
          <Link
            href="/auth/sign-in"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:-translate-y-0.5 hover:bg-indigo-500"
          >
            Create account
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
