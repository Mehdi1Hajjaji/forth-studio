'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const roleOptions = ['student', 'mentor', 'investor'] as const;
type RoleValue = typeof roleOptions[number];

export default function SignUpFormSimple() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<RoleValue>('student');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, username: username || undefined, role }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Registration failed');
      }
      // auto sign-in
      const result = await signIn('credentials', { email, password, redirect: false, callbackUrl: '/dashboard' });
      if (result?.ok) router.push(result.url || '/dashboard');
      else router.push('/auth/sign-in');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/70">Name</label>
        <input className="auth-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/70">Username</label>
        <input
          className="auth-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Choose a unique handle"
          maxLength={30}
        />
        <p className="text-xs text-white/40">Use letters, numbers, dots, underscores or hyphens.</p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/70">Email</label>
        <input className="auth-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@university.edu" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/70">Password</label>
        <input className="auth-input" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-white/70">Role</p>
        <div className="flex flex-wrap gap-2">
          {roleOptions.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRole(value)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                role === value
                  ? 'border-accent bg-accent/20 text-accent-foreground'
                  : 'border-white/15 bg-white/5 text-white/70 hover:text-white'
              }`}
            >
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>
      </div>
      {error ? <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition hover:-translate-y-0.5 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Creating…' : 'Create account'}
      </button>
    </form>
  );
}
