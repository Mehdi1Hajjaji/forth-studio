"use client";

export default function StoriesError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  console.error("/stories error:", error);
  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-surface/70 p-6 text-white/80">
      <h1 className="text-xl font-semibold text-white">Error loading stories</h1>
      <p className="mt-2 text-sm">We couldn’t load stories right now. This may be due to database connectivity or a missing environment variable. Please check Vercel Runtime Logs.</p>
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

