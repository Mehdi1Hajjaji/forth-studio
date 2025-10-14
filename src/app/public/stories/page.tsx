import Link from "next/link";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { storySummaries } from "@/lib/sample-data";

export default function PublicStoriesPage() {
  return (
    <PageWrapper>
      <header className="space-y-4 rounded-3xl border border-white/5 bg-surface/70 p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
          Student voices
        </p>
        <h1 className="text-3xl font-semibold text-white">
          Stories from CS students across the globe
        </h1>
        <p className="text-sm text-white/65 sm:text-base">
          These essays cover internships, hackathons, exchange semesters, and
          portfolio wins. Sign in to follow authors and leave comments.
        </p>
      </header>

      <section className="mt-10 space-y-6">
        {storySummaries.map((story) => (
          <article
            key={story.slug}
            className="rounded-3xl border border-white/10 bg-white/5 p-6"
          >
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/55">
              <span>{story.university}</span>
              <span>{story.readingTime}</span>
            </div>
            <h2 className="mt-3 text-xl font-semibold text-white">
              {story.title}
            </h2>
            <p className="mt-2 text-sm text-white/65">{story.summary}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {story.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <Link
              href={`/stories/${story.slug}`}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-white"
            >
              Read story
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
