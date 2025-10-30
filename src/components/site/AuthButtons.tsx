'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type AuthButtonsProps = {
  className?: string;
};

export function AuthButtons({ className }: AuthButtonsProps) {
  const { data: session, status } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  async function handleSignIn() {
    setIsProcessing(true);
    try {
      // Route to the custom sign-in page instead of hitting NextAuth GET actions
      router.push('/auth/sign-in');
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleSignOut() {
    setIsProcessing(true);
    try {
      // Avoid GET action; use redirect: false then navigate
      await signOut({ redirect: false });
      router.push('/');
    } finally {
      setIsProcessing(false);
    }
  }

  const loading = status === 'loading' || isProcessing;
  const containerClass = className ?? 'flex items-center gap-3 text-sm font-medium';

  if (status === 'authenticated' && session?.user) {
    const userAny = session.user as any;
    const username = userAny.username as string | undefined;
    const isAdmin = (userAny.role === 'ADMIN');
    return (
      <div className={containerClass}>
        {username ? (
          <Link
            href={`/profile/${username}`}
            className="pill-button pill-button--ghost text-xs"
            aria-label="My profile"
            title="My profile"
          >
            My Profile
          </Link>
        ) : null}
        {isAdmin ? (
          <Link
            href="/admin/challenges/suggestions"
            className="pill-button pill-button--ghost text-xs"
            aria-label="Admin"
            title="Admin"
          >
            Suggestions
          </Link>
        ) : null}
        <button
          type="button"
          onClick={handleSignOut}
          disabled={loading}
          className="pill-button pill-button--ghost text-xs disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Signing out.' : 'Sign out'}
        </button>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <button
        type="button"
        onClick={handleSignIn}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[#b586f7] via-[#3acdf2] to-[#D8B4FE] px-6 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? 'Loading.' : 'Sign in'}
      </button>
    </div>
  );
}
