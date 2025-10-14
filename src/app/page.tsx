import Link from "next/link";
import { LogoMark, TopNav } from "@/components/site/TopNav";
import { fetchLandingHighlights } from "@/lib/data";

type HighlightCard = {
  title: string;
  description: string;
  tag: string;
  meta: string;
  href?: string;
};

type AlgorithmHighlight =
  Awaited<ReturnType<typeof fetchLandingHighlights>>["algorithmOfDay"];

export default async function Home() {
  const { algorithmOfDay, campusInsights, communityCreations } =
    await fetchLandingHighlights();

  return (
    <div className="min-h-screen text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-x-0 -top-32 h-64 bg-hero-glow blur-3xl" />
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 pb-16 pt-10 lg:px-8">
          <TopNav />
          <main className="mt-16 flex flex-1 flex-col gap-14">
            <section className="grid gap-10 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
              <HeroCard />
              <AlgorithmCard algorithm={algorithmOfDay} />
            </section>

            <section id="algorithms" className="space-y-6">
              <SectionHeader
                heading="Campus & Career Insights"
                supporting="Curated spotlights from campus chapters and alumni mentors."
              />
              <CardGrid items={campusInsights.map(({ slug, ...card }) => ({ ...card, href: `/stories/${slug}` }))} />
            </section>

            <section id="stories" className="space-y-6">
              <SectionHeader
                heading="Community Creations"
                supporting="Peer-reviewed builds, write-ups, and studio drops from across the network."
              />
              <CardGrid items={communityCreations.map(({ slug, ...card }) => ({ ...card, href: `/projects/${slug}` }))} accent="surface-muted" />
            </section>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function HeroCard() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-surface py-12 pl-12 pr-6 shadow-card xl:pl-16">
      <div className="absolute right-0 top-0 hidden h-[500px] w-[380px] -translate-y-12 translate-x-16 rotate-6 rounded-full bg-gradient-to-br from-accent to-cyan-500 opacity-30 blur-3xl lg:block" />
      <div className="absolute bottom-0 right-0 hidden h-64 w-64 rounded-full border border-white/10 opacity-40 lg:block" />
      <div className="relative z-10 grid gap-12 lg:grid-cols-2">
        <div className="space-y-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/60">
            <SparklesIcon className="h-3.5 w-3.5 text-accent" />
            Level up daily
          </p>
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Advance Your Code,
              <br />
              Advance Your Career
            </h1>
            <p className="text-base text-white/65 sm:text-lg">
              Everyday algorithm challenges, peer-reviewed projects, and
              storytelling from your university network. Collaborate live,
              build in public, and ship the portfolio that stands out.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <a
              href="#algorithms"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-lg shadow-accent/50 transition hover:-translate-y-0.5 hover:bg-indigo-500"
            >
              Start Today&apos;s Algorithm
              <ArrowRightIcon className="h-4 w-4" />
            </a>
            <a
              href="#stories"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white/80 transition hover:text-white"
            >
              Read Career Stories
            </a>
          </div>
        </div>
        <div className="relative flex items-center justify-center">
          <div className="relative h-80 w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-surface-muted/80 via-surface to-surface-muted/40 p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.35),transparent_55%)]" />
            <div className="relative grid gap-3 text-sm text-white/70">
              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/40">
                    Live session
                  </p>
                  <p className="text-sm font-semibold text-white">
                    Neural graph studio Ã‚Â· Room D
                  </p>
                </div>
                <span className="rounded-full bg-success/20 px-3 py-1 text-xs font-semibold text-success">
                  Active
                </span>
              </div>
              <TimelineItem
                title="Pair programming portal"
                description="3 teammates connected Ã‚Â· latency 12ms"
              />
              <TimelineItem
                title="Photon whiteboard"
                description="Sketching heuristics for tomorrow"
              />
              <TimelineItem
                title="Synthesized dataset upload"
                description="Ready for review by mentor Hana"
              />
              <div className="mt-4 grid gap-2 rounded-xl border border-white/5 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wider text-white/40">
                  TodayÃ¢â‚¬â„¢s focus
                </p>
                <p className="text-lg font-semibold text-white">
                  Collaborative algorithm debugging with real-time visual
                  overlays.
                </p>
                <p className="text-xs text-white/50">
                  Shared with 18 peers Ã‚Â· Feedback window closes in 4h 12m
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlgorithmCard({ algorithm }: { algorithm: AlgorithmHighlight }) {
  if (!algorithm) {
    return (
      <aside className="flex flex-col justify-between rounded-3xl border border-white/5 bg-gradient-to-b from-surface to-surface-muted/80 p-8 shadow-lg shadow-black/30">
        <div className="space-y-6">
          <p className="text-sm font-medium uppercase tracking-wider text-accent">
            Algorithm of the Day
          </p>
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-white">
              New challenge coming soon
            </h2>
            <p className="text-sm text-white/65">
              Check back shortly for the latest campus-curated algorithm.
            </p>
          </div>
        </div>
        <Link
          href="/algorithms"
          className="mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent hover:text-accent-foreground"
        >
          Explore algorithms
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </aside>
    );
  }

  const solvedCount = algorithm.submissions?.length ?? 0;
  const tagSummary = algorithm.tags.map((entry) => entry.tag.name).join(", ");

  return (
    <aside className="flex flex-col justify-between rounded-3xl border border-white/5 bg-gradient-to-b from-surface to-surface-muted/80 p-8 shadow-lg shadow-black/30">
      <div className="space-y-6">
        <p className="text-sm font-medium uppercase tracking-wider text-accent">
          Algorithm of the Day
        </p>
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-white">
            {algorithm.title}
          </h2>
          <p className="text-sm text-white/65">{algorithm.summary}</p>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm text-white/70">
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <dt className="text-xs uppercase tracking-wider text-white/40">
              Difficulty
            </dt>
            <dd className="font-semibold text-white">{algorithm.difficulty}</dd>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <dt className="text-xs uppercase tracking-wider text-white/40">
              Solved by
            </dt>
            <dd className="font-semibold text-white">
              {solvedCount} students
            </dd>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <dt className="text-xs uppercase tracking-wider text-white/40">
              Tags
            </dt>
            <dd className="font-semibold text-white">
              {tagSummary || "Coming soon"}
            </dd>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <dt className="text-xs uppercase tracking-wider text-white/40">
              Mentor
            </dt>
            <dd className="font-semibold text-white">
              {algorithm.createdBy?.name ?? "forth.studio mentors"}
            </dd>
          </div>
        </dl>
      </div>
      <Link
        href={`/algorithms/${algorithm.slug}`}
        className="mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent hover:text-accent-foreground"
      >
        Attempt challenge
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </aside>
  );
}

function SectionHeader({
  heading,
  supporting,
}: {
  heading: string;
  supporting: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-2xl font-semibold text-white">{heading}</h2>
        <p className="text-sm text-white/55">{supporting}</p>
      </div>
      <a href="#" className="text-sm font-medium text-accent hover:text-white">
        View all
      </a>
    </div>
  );
}

function CardGrid({
  items,
  accent,
}: {
  items: HighlightCard[];
  accent?: "surface-muted";
}) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {items.map((card) => {
        const content = (
          <>
            <div className="absolute -top-24 right-0 h-44 w-44 rounded-full bg-accent/20 blur-3xl transition-opacity duration-300 group-hover:opacity-80" />
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              {card.tag}
            </span>
            <h3 className="mt-4 text-lg font-semibold text-white">{card.title}</h3>
            <p className="mt-2 text-sm text-white/60">{card.description}</p>
            <p className="mt-6 text-xs uppercase tracking-wider text-white/40">
              {card.meta}
            </p>
          </>
        );

        const article = (
          <article
            key={card.title}
            className={`group relative overflow-hidden rounded-2xl border border-white/5 p-6 transition duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-card ${
              accent ? "bg-surface-muted/70" : "bg-surface/70"
            }`}
          >
            {content}
          </article>
        );

        if (card.href) {
          return (
            <Link
              key={card.title}
              href={card.href}
              className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            >
              {article}
            </Link>
          );
        }

        return article;
      })}
    </div>
  );
}

function TimelineItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="relative grid gap-1 rounded-xl border border-white/5 bg-white/5 p-4">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="text-xs text-white/50">{description}</p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black/30">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6 text-sm text-white/50">
        <div className="flex items-center gap-2">
          <LogoMark />
          <span>(c) {new Date().getFullYear()} forth.studio</span>
        </div>
        <div className="flex gap-4">
          <a className="hover:text-white" href="#">
            Privacy
          </a>
          <a className="hover:text-white" href="#">
            Terms
          </a>
          <a className="hover:text-white" href="#">
            Support
          </a>
        </div>
      </div>
    </footer>
  );
}

function SparklesIcon({ className }: { className?: string }) {
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
      <path d="M5 3v4m2-2H3" />
      <path d="m17 15 1 5 1-5 5-1-5-1-1-5-1 5-5 1 5 1Z" />
      <path d="m4 17-1 2 1 1 2 1 1-2-1-1-2-1Z" />
    </svg>
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
