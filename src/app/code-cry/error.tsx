"use client";

export default function CodeCryError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  console.error("/code-cry error:", error);
  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-surface/70 p-6 text-white/80">
      <h1 className="text-xl font-semibold text-white">Error loading Code & Cry</h1>
      <p className="mt-2 text-sm">We couldn’t load sessions. Ensure DATABASE_URL is set, migrations are deployed, and LiveKit env vars exist if you’re joining rooms.</p>
      {error?.digest ? (
        <p className="mt-2 text-xs text-white/50">Ref: {error.digest}</p>
      ) : null}
      <div className="mt-4 flex gap-2">
        <button onClick={reset} className="rounded bg-accent px-3 py-1.5 text-sm font-semibold text-accent-foreground">Try again</button>
        <a href="/" className="rounded border border-white/15 px-3 py-1.5 text-sm">Go home</a>
      </div>
    </div>
  );
}

