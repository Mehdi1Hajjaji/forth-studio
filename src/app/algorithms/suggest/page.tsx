"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import Link from 'next/link';

export default function SuggestChallengePage() {
  const { status: authStatus } = useSession();
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'EASY'|'MEDIUM'|'HARD'|'ADVANCED'>('MEDIUM');
  const [details, setDetails] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle'|'sending'|'ok'|'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function submit() {
    setSubmitStatus('sending');
    setMessage(null);
    try {
      const res = await fetch('/api/algorithms/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, topic, difficulty, details }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || 'Failed');
      setSubmitStatus('ok');
      setMessage('Thanks! Your suggestion was received.');
      setTitle(''); setTopic(''); setDetails(''); setDifficulty('MEDIUM');
    } catch (e: any) {
      setSubmitStatus('error');
      setMessage(e.message || 'Could not submit your suggestion.');
    }
  }

  if (authStatus !== 'authenticated') {
    return (
      <PageWrapper>
        <section className="space-y-4 rounded-3xl border border-white/5 bg-surface/70 p-8 text-white/80">
          <h1 className="text-2xl font-semibold text-white">Suggest a challenge</h1>
          <p className="text-sm">Please sign in to submit suggestions.</p>
          <Link href="/auth/sign-in?callbackUrl=/algorithms/suggest" className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground">Sign in</Link>
        </section>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <section className="space-y-6 rounded-3xl border border-white/5 bg-surface/70 p-8">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Community</p>
          <h1 className="text-3xl font-semibold text-white">Suggest a challenge</h1>
          <p className="text-sm text-white/70">Propose a new algorithm problem for the community.</p>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs text-white/60">Title</span>
            <input className="auth-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Shortest Path with Portals" />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-white/60">Topic</span>
            <input className="auth-input" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., Graph Theory" />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-white/60">Difficulty</span>
            <select className="auth-input" value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)}>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </label>
          <div />
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs text-white/60">Details</span>
            <textarea className="auth-input" rows={8} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Describe the problem idea, constraints, and why it’s useful." />
          </label>
        </div>
        {message ? (
          <p className={`rounded-2xl border p-3 text-sm ${submitStatus === 'ok' ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100' : 'border-red-500/40 bg-red-500/10 text-red-100'}`}>{message}</p>
        ) : null}
        <div className="flex items-center justify-between">
          <Link href="/algorithms" className="text-sm text-white/70 hover:text-white">Back to algorithms</Link>
          <button onClick={submit} disabled={submitStatus==='sending' || !title || !topic || !details} className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground disabled:opacity-60">
            {submitStatus==='sending' ? 'Submitting…' : 'Submit suggestion'}
          </button>
        </div>
      </section>
    </PageWrapper>
  );
}
