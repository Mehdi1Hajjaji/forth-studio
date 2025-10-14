import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { fetchStoryDetail } from "@/lib/data";

type StoriesPageParams = {
  params: { slug: string };
};

export async function generateMetadata({
  params,
}: StoriesPageParams): Promise<Metadata> {
  const story = await fetchStoryDetail(params.slug);

  if (!story) {
    return {
      title: "Story not found - forth.studio",
    };
  }

  return {
    title: `${story.title} - forth.studio`,
    description: `${story.author.name ?? story.author.username} at ${story.author.university?.name ?? "forth.studio"} — campus story`,
  };
}

export default async function StoryDetailPage({
  params,
}: StoriesPageParams) {
  const story = await fetchStoryDetail(params.slug);

  if (!story) {
    notFound();
  }

  return (
    <PageWrapper inset>
      <article className="space-y-10 rounded-3xl border border-white/5 bg-surface/70 p-10 backdrop-blur">
        <header className="space-y-4 border-b border-white/10 pb-6">
          <Link
            href="/stories"
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to stories
          </Link>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
              {story.university?.name ?? "forth.studio"} |{" "}
              {story.publishedAt
                ? story.publishedAt.toLocaleDateString()
                : "Draft"}
            </p>
            <h1 className="text-3xl font-semibold text-white">
              {story.title}
            </h1>
            <p className="text-sm text-white/60">
              Written by {story.author.name ?? story.author.username}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {story.tags.map(({ tag }) => (
              <span
                key={tag.id}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        </header>

        <div className="space-y-6 text-base leading-relaxed text-white/70">
          {story.body.split("\n\n").map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <footer className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/65">
          <p className="font-semibold text-white">Share your own journey</p>
          <p className="mt-2">
            forth.studio is building a library of honest stories from student
            engineers. If you have a lesson or playbook to share, we would love
            to publish it.
          </p>
          <Link
            href="/auth/sign-in"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:-translate-y-0.5 hover:bg-indigo-500"
          >
            Submit a story
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
