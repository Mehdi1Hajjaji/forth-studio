import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata: Metadata = {
  title: "Reset password · forth.studio",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter the email you use for forth.studio and we’ll send you a secure link to create a new password."
      alternateAction={{
        label: "Remember it now?",
        linkLabel: "Back to sign in",
        href: "/auth/sign-in",
      }}
    >
      <form className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-white/70 transition hover:text-white"
          >
            University email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@university.edu"
            className="auth-input"
          />
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition hover:-translate-y-0.5 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-accent/40"
        >
          Send reset link
        </button>
      </form>

      <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/60">
        <p className="font-medium text-white">
          No inbox access right now?
        </p>
        <p className="mt-2">
          Ask your campus lead or send an email to{" "}
          <a
            href="mailto:support@forth.studio"
            className="font-medium text-accent hover:text-white"
          >
            support@forth.studio
          </a>{" "}
          so we can verify you manually.
        </p>
      </div>
    </AuthShell>
  );
}
