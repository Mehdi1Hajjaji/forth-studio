"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function GiveKarmaButton({ username, signedIn, isOwner, initialTotal }: { username: string; signedIn: boolean; isOwner: boolean; initialTotal: number; }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(initialTotal);
  const [pulse, setPulse] = useState(false);

  if (isOwner) return null;
  if (!signedIn) {
    return (
      <Link
        href={`/auth/sign-in?callbackUrl=${encodeURIComponent(`/profile/${username}`)}`}
        className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground"
      >
        Sign in to give Karma
      </Link>
    );
  }

  async function submit() {
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/profile/${encodeURIComponent(username)}/give-karma`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to send karma');
      setOpen(false);
      setReason('');
      setTotal(data.karmaTotal ?? total + 1);
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    } catch (e: any) {
      setError(e.message || 'Failed to send karma');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className={`text-3xl font-bold ${pulse ? 'animate-pulse' : ''}`}>{total}</div>
      <button
        className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground"
        onClick={() => setOpen(true)}
      >
        Give 1 Karma
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-surface/90 p-6 text-white">
            <h3 className="text-lg font-semibold">Why are you sending Karma?</h3>
            <p className="mt-1 text-sm text-white/70">Share a short reason (5–200 characters).</p>
            <textarea
              className="mt-3 w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white placeholder:text-white/40"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={200}
              placeholder="Thank you for helping me debug the LiveKit auth flow!"
            />
            {error ? (
              <p className="mt-2 rounded border border-red-500/40 bg-red-500/10 p-2 text-sm text-red-200">{error}</p>
            ) : null}
            <div className="mt-4 flex items-center justify-end gap-2">
              <button className="rounded border border-white/15 px-4 py-2 text-sm" onClick={() => setOpen(false)}>Cancel</button>
              <button
                className="rounded bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-60"
                disabled={sending || reason.trim().length < 5}
                onClick={submit}
              >
                {sending ? 'Sending…' : 'Send +1'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

