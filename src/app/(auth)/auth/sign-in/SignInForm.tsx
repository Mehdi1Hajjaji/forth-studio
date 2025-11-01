'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/AuthShell';

export function SignInForm() {
  const [email, setEmail] = useState('student@uni.dev');
  const [password, setPassword] = useState('test1234');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/';
  const errorCode = searchParams.get('error');

  const oauthErrorMessage = useMemo(() => {
    switch (errorCode) {
      case 'missing_email':
        return 'Your OAuth provider did not share an email address. Please ensure your account has a public email or use a different sign-in method.';
      case 'OAuthAccountNotLinked':
        return 'We found an existing account with this email. Sign in with your original provider, then link new providers from Settings.';
      case 'AccessDenied':
        return 'Access was denied by the provider. Please try again or check your OAuth app permissions.';
      case 'Configuration':
        return 'Authentication is temporarily unavailable due to a configuration issue. Please try again shortly.';
      case 'oauth_error':
        return 'Something went wrong while connecting to your provider. Please try again or use another login option.';
      case 'Callback':
      case 'CallbackRouteError':
        return 'We were unable to finish the OAuth callback. Check that the redirect URL matches your provider settings.';
      default:
        return null;
    }
  }, [errorCode]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (result?.ok) {
      router.push(result.url ?? callbackUrl);
    } else {
      setError('Incorrect email or password. Please try again.');
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to continue solving challenges, sharing stories, and leveling up with your campus crew."
      alternateAction={{
        label: 'First time here?',
        linkLabel: 'Create an account',
        href: '/auth/sign-up',
      }}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-white/70 transition hover:text-white"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@university.edu"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium text-white/70 transition hover:text-white"
            >
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-xs font-medium text-accent hover:text-white"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] p-3 text-xs text-white/60">
          <input
            id="remember"
            name="remember"
            type="checkbox"
            className="h-4 w-4 rounded border-white/20 bg-transparent text-accent focus:ring-accent"
            disabled={isSubmitting}
          />
          <label htmlFor="remember">Keep me signed in on this device</label>
        </div>
        {[error, oauthErrorMessage].filter(Boolean).map((message) => (
          <p
            key={message}
            className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200"
          >
            {message}
          </p>
        ))}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition hover:-translate-y-0.5 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Signing in…' : 'Continue'}
        </button>
      </form>
      <div className="mt-8 space-y-3">
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-white/30">
          <span className="h-px w-full bg-white/10" />
          or continue with
          <span className="h-px w-full bg-white/10" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <AuthProviderButton
            icon="github"
            label="GitHub"
            onClick={async () => {
              setIsSubmitting(true);
              try {
                await signIn('github', { callbackUrl });
              } finally {
                setIsSubmitting(false);
              }
            }}
          />
          <AuthProviderButton
            icon="google"
            label="Google"
            onClick={async () => {
              setIsSubmitting(true);
              try {
                await signIn('google', { callbackUrl });
              } finally {
                setIsSubmitting(false);
              }
            }}
          />
        </div>
        <p className="text-xs text-white/50">
          If buttons do nothing, set provider env vars in Vercel.
        </p>
      </div>
    </AuthShell>
  );
}

function AuthProviderButton({
  icon,
  label,
  onClick,
}: {
  icon: 'github' | 'google';
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white transition hover:border-accent hover:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="inline-flex h-5 w-5 items-center justify-center">
        {icon === 'github' ? <GitHubIcon /> : <GoogleIcon />}
      </span>
      Continue with {label}
    </button>
  );
}

function GitHubIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.72c-2.78.6-3.37-1.34-3.37-1.34-.45-1.14-1.1-1.44-1.1-1.44-.9-.61.07-.6.07-.6 1 .07 1.54 1.02 1.54 1.02.88 1.52 2.32 1.08 2.88.83a2.08 2.08 0 0 1 .62-1.31c-2.22-.25-4.55-1.11-4.55-4.95a3.87 3.87 0 0 1 1-2.69 3.6 3.6 0 0 1 .1-2.65s.84-.27 2.75 1a9.51 9.51 0 0 1 5 0c1.91-1.31 2.75-1 2.75-1a3.6 3.6 0 0 1 .1 2.65 3.87 3.87 0 0 1 1 2.69c0 3.85-2.34 4.69-4.57 4.94a2.33 2.33 0 0 1 .66 1.81V21c0 .26.18.57.69.47A10 10 0 0 0 12 2Z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M26.2665 14.3195C26.2665 13.4459 26.192 12.605 26.0542 11.7971H14.2803V16.5419H20.8243C20.5425 18.0669 19.6828 19.3585 18.3912 20.2241V23.2332H22.1885C24.4444 21.1793 26.2665 18.0416 26.2665 14.3195Z"
        fill="#4285F4"
      />
      <path
        d="M14.2787 26.1387C17.5346 26.1387 20.2676 25.067 22.1869 23.2333L18.3896 20.2241C17.3561 20.9176 16.0033 21.3523 14.2787 21.3523C11.141 21.3523 8.48575 19.2794 7.5372 16.436H3.61133V19.5434C5.51856 23.5599 9.57602 26.1387 14.2787 26.1387Z"
        fill="#34A853"
      />
      <path
        d="M7.53869 16.4359C7.29651 15.7424 7.1565 15.0015 7.1565 14.2418C7.1565 13.482 7.29651 12.7411 7.53869 12.0476V9.94019H3.61281C2.83166 11.565 2.38477 13.3421 2.38477 14.2418C2.38477 15.1415 2.83166 16.9185 3.61281 18.5433L7.53869 16.4359Z"
        fill="#FBBC05"
      />
      <path
        d="M14.2787 7.13129C16.1692 7.13129 17.8237 7.79978 19.129 8.98406L22.2793 5.83371C20.2631 3.94466 17.5301 2.61914 14.2787 2.61914C9.57604 2.61914 5.51858 5.19794 3.61133 9.93966L7.53721 12.0471C8.48576 9.20372 11.141 7.13129 14.2787 7.13129Z"
        fill="#EA4335"
      />
    </svg>
  );
}
