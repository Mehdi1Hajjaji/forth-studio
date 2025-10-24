import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const navItems = [
  { label: "Overview", href: "/dashboard" },
  { label: "Submit", href: "/submit" },
  { label: "Publish story", href: "/stories/new" },
  { label: "Publish project", href: "/projects/new" },
  { label: "Fail Wall", href: "/fail-wall" },
  { label: "Code & Cry", href: "/code-cry" },
  { label: "Account settings", href: "/settings" },
];

type DashboardShellProps = {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
  activePath: string;
  hero?: ReactNode;
};

export function DashboardShell({
  title,
  description,
  actions,
  children,
  activePath,
  hero,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 pb-20 pt-12 lg:px-8">
        {hero ? hero : null}
        <nav className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-[28px] px-6 py-5 shadow-card-soft">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">
              forth.studio
            </p>
            <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
            <p className="text-sm text-muted">{description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="order-last w-full justify-center md:order-none md:w-auto">
              <ThemeToggle />
            </div>
            {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
          </div>
        </nav>
        <div className="grid gap-8 lg:grid-cols-[240px,minmax(0,1fr)]">
          <aside className="surface-card rounded-[28px] p-4">
            <ul className="space-y-2 text-sm font-medium text-muted">
              {navItems.map((item) => {
                const isActive = item.href === activePath;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block rounded-2xl px-4 py-2 transition ${
                        isActive
                          ? "bg-accent text-accent-foreground shadow-card"
                          : "hover:bg-surface-muted/70 hover:text-foreground"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </aside>
          <main className="space-y-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
