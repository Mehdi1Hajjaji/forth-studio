import Link from "next/link";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { fetchProblemList } from "@/lib/data";

export default async function PublicAlgorithmsPage() {
  const algorithms = await fetchProblemList();
  return (
    <PageWrapper>
      <header className="space-y-4 rounded-3xl border border-white/5 bg-surface/70 p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
          Explore practice paths
        </p>
        <h1 className="text-3xl font-semibold text-white">
          Algorithms popular with campus mentors
        </h1>
        <p className="text-sm text-white/65 sm:text-base">
          Try the challenges below without signing in. When you want to submit a
          solution, create a free account to unlock peer review and scoring.
        </p>
      </header>

      <section className="mt-10 space-y-4">
        <table className="w-full overflow-hidden rounded-2xl border border-white/5 text-left text-sm text-white/70">
          <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-white/50">
            <tr>
              <th className="px-4 py-3 font-semibold">Algorithm</th>
              <th className="px-4 py-3 font-semibold">Difficulty</th>
              <th className="px-4 py-3 font-semibold">Campus</th>
              <th className="px-4 py-3 font-semibold">Solved</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {algorithms.map((item, index) => (
              <tr
                key={item.slug}
                className={index % 2 === 0 ? "bg-white/5" : "bg-white/10"}
              >
                <td className="px-4 py-4 text-white">
                  <div className="font-semibold">{item.title}</div>
                  <div className="text-xs text-white/50">{item.summary}</div>
                </td>
                <td className="px-4 py-4 text-white/70">{item.difficulty}</td>
                <td className="px-4 py-4 text-white/60">{item.university}</td>
                <td className="px-4 py-4 text-white/60">{item.solved}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/algorithms/${item.slug}`}
                      className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-accent hover:text-white"
                    >
                      Read brief
                    </Link>
                    <Link
                      href="/auth/sign-in"
                      className="rounded-full border border-accent/40 px-3 py-1 text-xs font-semibold text-accent hover:bg-accent/10"
                    >
                      Attempt
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </PageWrapper>
  );
}
