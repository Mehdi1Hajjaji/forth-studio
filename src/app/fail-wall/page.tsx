import Link from "next/link";
import { TopNav } from "@/components/site/TopNav";
import { fetchFailPosts } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import FailWallFeed from "./FailWallFeed";

export const dynamic = "force-dynamic";

export default async function FailWallPage() {
  const currentUser = await getCurrentUser();
  const posts = await fetchFailPosts({ limit: 30, viewerId: currentUser?.id });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-surface text-white">
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-10 lg:px-8">
        <TopNav />
        <section className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,2.2fr),minmax(0,1fr)] lg:gap-12">
          <div>
            <header className="mb-10 space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                Community
              </span>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                The Fail Wall
              </h1>
              <p className="max-w-2xl text-base text-white/70">
                A judgment-free zone where we celebrate the real stories behind breakthroughs. Share the project you attempted, what went sideways, and the lesson you’re taking forward.
              </p>
            </header>

            <FailWallFeed initialPosts={posts} currentUser={currentUser} />
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-lg font-semibold text-white">Why we built this</h2>
              <ul className="mt-4 space-y-3 text-sm text-white/70">
                <li>• Normalize the messy middle so we all keep experimenting.</li>
                <li>• Learn faster by sharing what went wrong, not just final demos.</li>
                <li>• Earn the Resilience Badge when the community rallies behind your honesty.</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-accent/40 bg-accent/10 p-6 text-sm text-accent-foreground">
              <h3 className="text-base font-semibold text-accent-foreground">Resilience Badge</h3>
              <p className="mt-3 text-white/80">
                Each week we celebrate the most helpful fail post. High engagement—likes, thoughtful comments, shares—earns the author a glowing badge on their profile.
              </p>
              {currentUser ? (
                <p className="mt-4 text-xs text-white/60">
                  Keep showing up. Your honesty could be the next spotlight.
                </p>
              ) : (
                <p className="mt-4 text-xs text-white/60">
                  <Link href="/auth/sign-in" className="font-semibold text-accent">
                    Sign in
                  </Link>{" "}
                  to add your story and support others.
                </p>
              )}
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
