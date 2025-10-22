'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { FailPostSummary } from '@/lib/data';

type Props = {
  currentUser: { id: string; name?: string | null } | null;
  onCreated: (post: FailPostSummary) => void;
};

export default function FailWallComposer({ currentUser, onCreated }: Props) {
  const [projectAttempt, setProjectAttempt] = useState('');
  const [failureReason, setFailureReason] = useState('');
  const [lessonLearned, setLessonLearned] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="mb-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-sm text-white/70">
        <h2 className="text-lg font-semibold text-white">Ready to add your story?</h2>
        <p className="mt-3">
          Sign in to publish your fail wall entry, encourage peers, and compete for the Resilience Badge.
        </p>
        <Link
          href="/auth/sign-in?callbackUrl=/fail-wall"
          className="mt-4 inline-flex items-center justify-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-card transition hover:-translate-y-0.5 hover:bg-lime-400/80"
        >
          Sign in to share
        </Link>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/fail-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectAttempt, failureReason, lessonLearned }),
      });

      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body.error || 'Could not publish your fail post.');
      }

      onCreated(body.data as FailPostSummary);
      setProjectAttempt('');
      setFailureReason('');
      setLessonLearned('');
      setMessage('Thanks for sharing! Your post is now live.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to publish right now. Try again soon.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-10 space-y-5 rounded-3xl border border-accent/30 bg-accent/10 p-6 shadow-card backdrop-blur"
    >
      <div>
        <label className="text-sm font-semibold uppercase tracking-[0.25em] text-accent-foreground">
          I tried to build…
        </label>
        <textarea
          value={projectAttempt}
          onChange={(event) => setProjectAttempt(event.target.value)}
          placeholder="A WebGL-powered study planner with live collaboration"
          required
          minLength={10}
          maxLength={240}
          className="mt-2 w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
          rows={2}
        />
      </div>
      <div>
        <label className="text-sm font-semibold uppercase tracking-[0.25em] text-accent-foreground">
          It failed because…
        </label>
        <textarea
          value={failureReason}
          onChange={(event) => setFailureReason(event.target.value)}
          placeholder="My data model fell apart when we added team notes, and I over-scoped the MVP."
          required
          minLength={20}
          maxLength={2000}
          className="mt-2 w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
          rows={4}
        />
      </div>
      <div>
        <label className="text-sm font-semibold uppercase tracking-[0.25em] text-accent-foreground">
          I learned…
        </label>
        <textarea
          value={lessonLearned}
          onChange={(event) => setLessonLearned(event.target.value)}
          placeholder="Ship the core workflow first, validate with users weekly, and grab a mentor before diving into WebGL."
          required
          minLength={20}
          maxLength={2000}
          className="mt-2 w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
          rows={3}
        />
      </div>
      {message ? (
        <p className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/80">
          {message}
        </p>
      ) : null}
      <div className="flex items-center justify-between text-xs text-white/50">
        <p>
          Share specifics—your transparency helps everyone grow.
        </p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:-translate-y-0.5 hover:bg-lime-400/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Publishing…' : 'Post to the Fail Wall'}
        </button>
      </div>
    </form>
  );
}

