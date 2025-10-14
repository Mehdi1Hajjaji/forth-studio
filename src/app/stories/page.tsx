import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/layout/PageIntro";
import { PageWrapper } from "@/components/layout/PageWrapper";
import {
  fetchCampusHighlights,
  fetchStoryFilterOptions,
  fetchStorySummaries,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "Stories - forth.studio",
  description:
    "Read journeys from university CS students worldwide: internships, research breakthroughs, portfolio builds, and campus community wins.",
};

type StoriesPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function StoriesPage({ searchParams }: StoriesPageProps) {
  const queryParam = searchParams?.q;
  const universityParam = searchParams?.university;
  const tagsParam = searchParams?.tag;

  const query =
    typeof queryParam === "string"
      ? queryParam
      : Array.isArray(queryParam)
        ? queryParam[0]
        : "";

  const selectedUniversity =
    typeof universityParam === "string" ? universityParam : "";

  const selectedTags = Array.isArray(tagsParam)
    ? tagsParam.filter(Boolean)
    : typeof tagsParam === "string"
      ? [tagsParam]
      : [];

  const [stories, highlights, filterOptions] = await Promise.all([
    fetchStorySummaries({
      search: query || undefined,
      universitySlug: selectedUniversity || undefined,
      tags: selectedTags.length ? selectedTags : undefined,
    }),
    fetchCampusHighlights(),
    fetchStoryFilterOptions(),
  ]);

  const featuredSlug = stories[0]?.slug;

  return (
    <PageWrapper>
      <PageIntro
        eyebrow="Career narratives"
        title="Stories from the campus coding community"
        description="Students share how they navigated internships, landed their first roles, and shipped ambitious projects with their classmates. Filter by university or theme to find inspiration that speaks your language."
        actions={
          <Link
            href="/auth/sign-in"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:-translate-y-0.5 hover:bg-indigo-500"
          >
            Share my story
          </Link>
        }
      />

      <StoryFilters
        query={query}
        universities={filterOptions.universities}
        tags={filterOptions.tags}
        selectedUniversity={selectedUniversity}
        selectedTags={selectedTags}
      />

      <section className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
        <div className="space-y-6">
          {stories.map((story) => (
            <article
              key={story.slug}
              className={`group rounded-3xl border border-white/5 bg-surface/60 p-6 transition hover:-translate-y-1 hover:border-accent/30 hover:shadow-card ${
                story.slug === featuredSlug ? "border-accent/40 bg-accent/10" : ""
              }`}
            >
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.25em] text-white/50">
                <span>{story.university}</span>
                <span className="h-px w-8 bg-white/15" />
                <span>{story.readingTime}</span>
              </div>
              <div className="mt-4 space-y-3">
                <h2 className="text-xl font-semibold text-white">{story.title}</h2>
                <p className="text-sm text-white/65">{story.summary}</p>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
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
                  className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-white"
                >
                  Read story
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
          {!stories.length ? (
            <p className="rounded-3xl border border-white/5 bg-white/5 p-6 text-sm text-white/60">
              {query || selectedUniversity || selectedTags.length
                ? "No stories match your filters yet. Try adjusting your search."
                : "No published stories yet. Sign in to become one of the first authors."}
            </p>
          ) : null}
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-white/5 bg-surface/60 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
              Spotlight themes
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li>Internships and recruiting tips</li>
              <li>Community-led coding bootcamps</li>
              <li>International student journeys</li>
              <li>Projects that became startups</li>
            </ul>
          </section>
          <section className="rounded-3xl border border-white/5 bg-surface/60 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
              Campus highlights
            </h3>
            <ul className="mt-4 space-y-4 text-sm text-white/70">
              {highlights.map((highlight) => (
                <li key={highlight.name}>
                  <p className="font-semibold text-white">{highlight.name}</p>
                  <p>{highlight.headline}</p>
                  <p className="text-white/50">{highlight.impact}</p>
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-3xl border border-white/5 bg-surface/60 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
              Contribute
            </h3>
            <p className="mt-3 text-sm text-white/65">
              Submit your story draft and a mentor editor will help tighten the
              structure before publishing.
            </p>
            <Link
              href="/auth/sign-in"
              className="mt-4 inline-flex items-center justify-center rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-accent hover:text-white"
            >
              Pitch a story
            </Link>
          </section>
        </aside>
      </section>
    </PageWrapper>
  );
}

type StoryFiltersProps = {
  query: string;
  universities: { id: string; name: string; slug: string }[];
  tags: { id: string; name: string }[];
  selectedUniversity: string;
  selectedTags: string[];
};

function StoryFilters({
  query,
  universities,
  tags,
  selectedUniversity,
  selectedTags,
}: StoryFiltersProps) {
  const selectedTagSet = new Set(selectedTags);

  return (
    <section className="mt-10 rounded-3xl border border-white/5 bg-surface/60 p-6 backdrop-blur">
      <form className="space-y-6 text-sm text-white/70" method="get">
        <div className="grid gap-4 md:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
              Search keywords
            </span>
            <input
              type="search"
              name="q"
              placeholder="Try internships, AI research, hackathon..."
              defaultValue={query}
              className="auth-input"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
              University
            </span>
            <select
              name="university"
              defaultValue={selectedUniversity}
              className="auth-input"
            >
              <option value="">All universities</option>
              {universities.map((university) => (
                <option key={university.id} value={university.slug}>
                  {university.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
            Tags
          </p>
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => {
              const inputId = `tag-${tag.id}`;
              return (
                <label
                  key={tag.id}
                  htmlFor={inputId}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    selectedTagSet.has(tag.name)
                      ? "border-accent/60 bg-accent/20 text-white"
                      : "border-white/10 bg-white/5 hover:border-accent/40 hover:text-white"
                  }`}
                >
                  <input
                    id={inputId}
                    name="tag"
                    type="checkbox"
                    value={tag.name}
                    defaultChecked={selectedTagSet.has(tag.name)}
                    className="h-0 w-0 opacity-0"
                  />
                  #{tag.name}
                </label>
              );
            })}
            {!tags.length ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/40">
                Story tags are coming soon.
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground transition hover:-translate-y-0.5 hover:bg-indigo-500"
          >
            Apply filters
          </button>
          <Link
            href="/stories"
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/70 transition hover:border-accent/40 hover:text-white"
          >
            Reset
          </Link>
        </div>
      </form>
    </section>
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
