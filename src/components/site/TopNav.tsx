import Link from "next/link";
import { AuthButtons } from "./AuthButtons";

const navLinks = [
  { label: "Algorithms", href: "/algorithms" },
  { label: "Stories", href: "/stories" },
  { label: "Best Solutions", href: "/best-solutions" },
];

export function TopNav() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/5 bg-surface/60 px-6 py-4 backdrop-blur">
      <Link href="/" className="flex items-center gap-3">
        <LogoMark />
        <span className="text-lg font-semibold tracking-tight text-white">
          forth<span className="text-accent">.studio</span>
        </span>
      </Link>

      <nav className="flex flex-1 items-center justify-center gap-6 text-sm font-medium text-white/70 max-md:order-last">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="transition-colors hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/60 lg:flex">
          <SearchIcon className="h-4 w-4 text-white/50" />
          <span>Search</span>
          <kbd className="rounded bg-surface-muted/60 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-white/40">
            Ctrl K
          </kbd>
        </div>
        <AuthButtons />
      </div>
    </header>
  );
}

export function LogoMark() {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 font-semibold text-white shadow-lg shadow-indigo-500/40">
      {"{}"}
    </span>
  );
}

function SearchIcon({ className }: { className?: string }) {
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
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
