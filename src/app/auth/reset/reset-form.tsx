'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function ResetForm() {
  const search = useSearchParams();
  const router = useRouter();
  const token = search.get('token') ?? '';
  const email = search.get('email') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<'idle'|'saving'|'ok'|'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !email) {
      setMessage('Invalid password reset link.');
      return;
    }
    if (password !== confirm) {
      setMessage('Passwords do not match.');
      return;
    }
    setStatus('saving');
    setMessage(null);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword: password }),
      });
      if (!res.ok) throw new Error('reset failed');
      setStatus('ok');
      setMessage('Password updated. Redirecting to sign in…');
      setTimeout(() => router.push('/auth/sign-in'), 1200);
    } catch (err) {
      setStatus('error');
      setMessage('This link is invalid or has expired. Request a new one.');
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-surface/70 p-6">
      <h1 className="text-xl font-semibold text-white">Create new password</h1>
      <p className="mt-1 text-sm text-white/60">For {email || 'your account'}</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input
          type="password"
          required
          minLength={8}
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="auth-input"
        />
        <input
          type="password"
          required
          minLength={8}
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="auth-input"
        />
        {message ? (
          <p className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">{message}</p>
        ) : null}
        <button
          type="submit"
          disabled={status === 'saving'}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition hover:-translate-y-0.5 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'saving' ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  );
}

