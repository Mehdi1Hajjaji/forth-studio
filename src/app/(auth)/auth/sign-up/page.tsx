import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata: Metadata = {
  title: "Create account · forth.studio",
};

const majors = [
  "Computer Science",
  "Software Engineering",
  "Data Science",
  "AI & Robotics",
  "Cybersecurity",
  "Other",
];

const graduationYears = Array.from({ length: 6 }, (_, index) => {
  const year = new Date().getFullYear() + index;
  return year.toString();
});

export default function SignUpPage() {
  return (
    <AuthShell
      title="Join the studio"
      subtitle="Solve daily problems, publish stories from your campus, and build your portfolio with peers by your side."
      alternateAction={{
        label: "Already have an account?",
        linkLabel: "Sign in",
        href: "/auth/sign-in",
      }}
    >
      <form className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" htmlFor="first-name">
            <input
              id="first-name"
              name="firstName"
              required
              placeholder="Amina"
              autoComplete="given-name"
              className="auth-input"
            />
          </Field>
          <Field label="Last name" htmlFor="last-name">
            <input
              id="last-name"
              name="lastName"
              required
              placeholder="El Idrissi"
              autoComplete="family-name"
              className="auth-input"
            />
          </Field>
        </div>

        <Field label="University email" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="amina.idrissi@um5r.ma"
            autoComplete="email"
            className="auth-input"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Major" htmlFor="major">
            <select id="major" name="major" defaultValue="" required className="auth-input">
              <option value="" disabled>
                Select your focus
              </option>
              {majors.map((major) => (
                <option key={major} value={major}>
                  {major}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Graduation year" htmlFor="graduation-year">
            <select
              id="graduation-year"
              name="graduationYear"
              defaultValue=""
              required
              className="auth-input"
            >
              <option value="" disabled>
                Choose a year
              </option>
              {graduationYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field
          label="Password"
          htmlFor="password"
          helper="Use 8+ characters with a mix of letters, numbers, and symbols."
        >
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="••••••••"
            autoComplete="new-password"
            minLength={8}
            className="auth-input"
          />
        </Field>

        <Field label="Pronouns" htmlFor="pronouns">
          <input
            id="pronouns"
            name="pronouns"
            placeholder="She/Her, He/Him, They/Them..."
            className="auth-input"
          />
        </Field>

        <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-white/60">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="terms"
              required
              className="mt-0.5 h-4 w-4 rounded border-white/20 bg-transparent text-accent focus:ring-accent"
            />
            <span>
              I agree to the{" "}
              <Link href="/terms" className="text-accent hover:text-white">
                Terms of Use
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-accent hover:text-white">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="newsletter"
              className="mt-0.5 h-4 w-4 rounded border-white/20 bg-transparent text-accent focus:ring-accent"
            />
            <span>
              Send me weekly campus stories and challenge highlights (optional).
            </span>
          </label>
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition hover:-translate-y-0.5 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-accent/40"
        >
          Create account
        </button>
      </form>
      <p className="mt-6 text-center text-xs text-white/40">
        By continuing, you confirm that you are currently enrolled or recently graduated from a university Computer Science or related program.
      </p>
      <div className="mt-8 space-y-3">
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-white/30">
          <span className="h-px w-full bg-white/10" />
          or continue with
          <span className="h-px w-full bg-white/10" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <AuthProviderButton icon="github">GitHub</AuthProviderButton>
          <AuthProviderButton icon="google">Google</AuthProviderButton>
        </div>
      </div>
    </AuthShell>
  );
}

function Field({
  label,
  htmlFor,
  helper,
  children,
}: {
  label: string;
  htmlFor: string;
  helper?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-white/70 transition hover:text-white"
      >
        {label}
      </label>
      {children}
      {helper ? <p className="text-xs text-white/40">{helper}</p> : null}
    </div>
  );
}

function AuthProviderButton({
  icon,
  children,
}: {
  icon: "github" | "google";
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className="flex items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white transition hover:border-accent hover:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-accent/40"
    >
      <span className="inline-flex h-5 w-5 items-center justify-center">
        {icon === "github" ? <GitHubIcon /> : <GoogleIcon />}
      </span>
      Continue with {children}
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
