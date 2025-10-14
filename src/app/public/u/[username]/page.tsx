import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { sampleProfile } from "@/lib/sample-data";

type Params = {
  params: { username: string };
};

export function generateMetadata({ params }: Params): Metadata {
  if (params.username !== sampleProfile.username) {
    return {
      title: "Community profile - forth.studio",
    };
  }

  return {
    title: `${sampleProfile.name} (@${sampleProfile.username}) - forth.studio`,
    description: sampleProfile.bio,
  };
}

export default function PublicProfilePage({ params }: Params) {
  if (params.username !== sampleProfile.username) {
    notFound();
  }

  return (
    <PageWrapper inset>
      <article className="space-y-8 rounded-3xl border border-white/5 bg-surface/70 p-10 backdrop-blur">
        <header className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              forth.studio member
            </p>
            <h1 className="text-3xl font-semibold text-white">
              {sampleProfile.name}
            </h1>
            <p className="text-sm text-white/60">
              @{sampleProfile.username} · {sampleProfile.university}
            </p>
            <p className="mt-4 text-sm text-white/70">{sampleProfile.bio}</p>
          </div>
          <Link
            href="/auth/sign-in"
            className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white/80 transition hover:text-white"
          >
            Sign in to follow
          </Link>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">Skills</h2>
            <ul className="flex flex-wrap gap-2 text-sm text-white/70">
              {sampleProfile.skills.map((skill) => (
                <li
                  key={skill}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">Achievements</h2>
            <ul className="space-y-2 text-sm text-white/70">
              {sampleProfile.achievements.map((achievement) => (
                <li key={achievement} className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent" />
                  <span>{achievement}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <footer className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/65">
          <p className="font-semibold text-white">Collaborate with {sampleProfile.name}</p>
          <p className="mt-2">
            Sign in to invite {sampleProfile.name.split(" ")[0]} to your project, request code reviews, or join a campus study group.
          </p>
          <Link
            href="/auth/sign-in"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground transition hover:-translate-y-0.5 hover:bg-indigo-500"
          >
            Create account
          </Link>
        </footer>
      </article>
    </PageWrapper>
  );
}
