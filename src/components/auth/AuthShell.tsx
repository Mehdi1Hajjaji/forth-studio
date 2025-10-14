import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  title: string;
  subtitle: string;
  alternateAction: {
    label: string;
    linkLabel: string;
    href: string;
  };
  children: ReactNode;
};

export function AuthShell({
  title,
  subtitle,
  alternateAction,
  children,
}: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col justify-center bg-gradient-to-br from-[#050b1a] via-[#0D152B] to-[#0F172A] px-6 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.25),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(59,130,246,0.18),transparent_65%)]" />
      <div className="relative mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition hover:text-white"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 text-lg text-white shadow-lg shadow-indigo-500/40">
              {"{}"}
            </span>
            forth<span className="text-accent">.studio</span>
          </Link>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-xl shadow-indigo-900/30 backdrop-blur-lg">
          <div className="mb-6 space-y-2 text-center">
            <h1 className="text-2xl font-semibold text-white sm:text-3xl">
              {title}
            </h1>
            <p className="text-sm text-white/60">{subtitle}</p>
          </div>
          {children}
          <p className="mt-8 text-center text-sm text-white/50">
            {alternateAction.label}{" "}
            <Link
              href={alternateAction.href}
              className="font-medium text-accent hover:text-white"
            >
              {alternateAction.linkLabel}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
