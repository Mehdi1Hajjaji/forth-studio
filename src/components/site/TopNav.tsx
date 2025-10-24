import Image from "next/image";
import Link from "next/link";
import { AuthButtons } from "./AuthButtons";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import ServicesMenuButton from "./ServicesMenuButton";

const navLinks = [
  { label: "Algorithms", href: "/algorithms" },
  { label: "Stories", href: "/stories" },
  { label: "Best Solutions", href: "/best-solutions" },
];

export function TopNav() {
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-[1180px] items-center justify-between px-8 py-10">
      <Link
        href="/"
        className="flex items-center gap-4 transition hover:opacity-90"
        aria-label="forth.studio home"
      >
        <LogoMark />
      </Link>

      <nav className="hidden items-center gap-6 text-[0.95rem] font-medium tracking-[0.015em] lg:flex">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} className="nav-link">
            {link.label}
          </Link>
        ))}
        <ServicesMenuButton />
      </nav>

      <div className="flex items-center gap-5">
        <Link
          href="/best-solutions"
          className="hidden items-center gap-2 rounded-full border border-accent/50 bg-transparent px-5 py-2 text-sm font-semibold text-white/85 transition hover:border-accent/70 hover:text-white lg:flex"
        >
          <SearchIcon className="h-4 w-4 text-accent" />
          Best Solutions
        </Link>
        <ThemeToggle />
        <AuthButtons />
      </div>
    </header>
  );
}

export function LogoMark() {
  return (
    <span className="inline-flex items-center justify-center">
      <Image
        src="/assets/icons/logo.png"
        alt="forth.studio logo"
        width={144}
        height={48}
        className="h-12 w-auto"
        priority
      />
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

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 4.5 6 7.5l3-3" />
    </svg>
  );
}
