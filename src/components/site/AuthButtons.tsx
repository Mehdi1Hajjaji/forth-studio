'use client';

import { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

type AuthButtonsProps = {
  className?: string;
};

export function AuthButtons({ className }: AuthButtonsProps) {
  const { data: session, status } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleSignIn() {
    setIsProcessing(true);
    try {
      await signIn(undefined, { callbackUrl: '/' });
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleSignOut() {
    setIsProcessing(true);
    try {
      await signOut({ callbackUrl: '/' });
    } finally {
      setIsProcessing(false);
    }
  }

  const loading = status === 'loading' || isProcessing;
  const containerClass = className ?? 'flex items-center gap-3 text-sm font-medium';

  if (status === 'authenticated' && session?.user) {
    return (
      <div className={containerClass}>
        <span className="hidden text-white/70 md:block">
          {session.user.name ?? session.user.email}
        </span>
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
