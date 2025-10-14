import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { label: "Overview", href: "/dashboard" },
  { label: "Submit", href: "/submit" },
  { label: "Publish story", href: "/stories/new" },
  { label: "Publish project", href: "/projects/new" },
];

type DashboardShellProps = {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
  activePath: string;
};

export function DashboardShell({
  title,
  description,
  actions,
  children,
  activePath,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-background text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 pb-16 pt-12 lg:px-8">
        <nav className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/5 bg-surface/70 px-6 py-4 backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              forth.studio
            </p>
            <h1 className="text-xl font-semibold text-white">{title}</h1>
            <p className="text-sm text-white/60">{description}</p>
          </div>
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </nav>
        <div className="grid gap-8 lg:grid-cols-[240px,minmax(0,1fr)]">
          <aside className="rounded-2xl border border-white/5 bg-surface/70 p-4">
            <ul className="space-y-2 text-sm font-medium text-white/70">
              {navItems.map((item) => {
                const isActive = item.href === activePath;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block rounded-xl px-4 py-2 transition ${
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </aside>
          <main className="space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
