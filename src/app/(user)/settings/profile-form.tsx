'use client';

import { useState } from 'react';

type RoleOption = 'student' | 'mentor' | 'investor' | 'admin';

type ProfileFormProps = {
  initialRole: RoleOption;
  initialUniversityId: string | null;
  universities: { id: string; name: string }[];
};

const roleOptions: { value: RoleOption; label: string }[] = [
  { value: 'student', label: 'Student' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'investor', label: 'Investor' },
];

export default function AccountProfileForm({ initialRole, initialUniversityId, universities }: ProfileFormProps) {
  const canEditRole = initialRole !== 'admin';
  const [role, setRole] = useState<RoleOption>(canEditRole ? initialRole : 'student');
  const [universityId, setUniversityId] = useState<string | 'none'>(initialUniversityId ?? 'none');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('saving');
    setMessage(null);

    try {
      const payload: Record<string, unknown> = {
        universityId: universityId === 'none' ? null : universityId,
      };
      if (canEditRole) {
        payload.role = role;
      }

      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Could not update profile.');
      }

      setStatus('saved');
      setMessage('Profile updated successfully.');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Could not update profile.');
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-card">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-white">Profile & role</h2>
        <p className="text-sm text-white/60">Update how you collaborate across forth.studio and keep your university info current.</p>
      </header>
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <p className="text-sm font-medium text-white/70">Role</p>
          <p className="text-xs text-white/40">Choose the capacity in which you participate. This influences featured content and challenges.</p>
          {canEditRole ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {roleOptions.map((option) => {
                const isActive = option.value === role;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRole(option.value)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                      isActive
                        ? 'border-accent bg-accent/20 text-accent-foreground'
                        : 'border-white/15 bg-white/5 text-white/70 hover:text-white'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="mt-2 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
              Administrator role managed by platform operators.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="university" className="text-sm font-medium text-white/70">University</label>
          <select
            id="university"
            className="auth-input"
            value={universityId}
            onChange={(e) => setUniversityId(e.target.value as typeof universityId)}
          >
            <option value="none">No university selected</option>
            {universities.map((uni) => (
              <option key={uni.id} value={uni.id}>
                {uni.name}
              </option>
            ))}
          </select>
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
          {status === 'saving' ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </section>
  );
}
