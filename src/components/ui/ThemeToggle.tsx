'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isLight = theme === 'light';

  // Visual rules required:
  // - In light mode: white background, black text, label "Dark"
  // - In dark mode:  black background, white text, label "Light"
  const base =
    'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40';
  const visual =
    'bg-white text-black border-black/10 hover:bg-white dark:bg-black dark:text-white dark:border-white/20 dark:hover:bg-black';

  const label = isLight ? 'Dark' : 'Light';

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      aria-pressed={!isLight}
      title={isLight ? 'Switch to Dark mode' : 'Switch to Light mode'}
      onClick={() => setTheme(isLight ? 'dark' : 'light')}
      className={className ? `${base} ${visual} ${className}` : `${base} ${visual}`}
    >
      {isLight ? (
        <MoonIcon className="h-4 w-4" />
      ) : (
        <SunIcon className="h-4 w-4" />
      )}
      <span className="font-bold">{label}</span>
    </button>
  );
}

function SunIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
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
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
