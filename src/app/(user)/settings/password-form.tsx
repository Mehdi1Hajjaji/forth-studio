'use client';

import { useState } from 'react';

export default function AccountPasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (newPassword !== confirmPassword) {
      setStatus('error');
      setMessage('New passwords do not match.');
      return;
    }
    setStatus('saving');
    try {
      const res = await fetch('/api/account/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Could not update password.');
      }
      setStatus('saved');
      setMessage('Password updated successfully. Please use the new password next time you sign in.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Could not update password.');
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-card">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-white">Password</h2>
        <p className="text-sm text-white/60">Set a strong password to keep your account secure.</p>
      </header>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/70" htmlFor="current-password">Current password</label>
          <input
            id="current-password"
            type="password"
            required
            minLength={8}
            className="auth-input"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/70" htmlFor="new-password">New password</label>
          <input
            id="new-password"
            type="password"
            required
            minLength={8}
            className="auth-input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/70" htmlFor="confirm-password">Confirm new password</label>
          <input
            id="confirm-password"
            type="password"
            required
            minLength={8}
            className="auth-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat new password"
          />
        </div>
        {message ? (
          <p className={`rounded-lg border px-4 py-2 text-sm ${
            status === 'error'
              ? 'border-red-500/40 bg-red-500/10 text-red-200'
              : 'border-white/10 bg-white/5 text-white/80'
          }`}>{message}</p>
        ) : null}
        <button
          type="submit"
          disabled={status === 'saving'}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition hover:-translate-y-0.5 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'saving' ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </section>
  );
}

