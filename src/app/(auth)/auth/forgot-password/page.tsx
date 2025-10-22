import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotForm } from "./ForgotForm";

export const metadata: Metadata = {
  title: "Reset password · forth.studio",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we’ll send you a secure link. In dev, check the server console for the URL."
      alternateAction={{
        label: "Remember it now?",
        linkLabel: "Back to sign in",
        href: "/auth/sign-in",
      }}
    >
      <ForgotForm />

      <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/60">
        <p className="font-medium text-white">Trouble?</p>
        <p className="mt-2">
          Ask your campus lead or email
          <a href="mailto:support@forth.studio" className="ml-1 font-medium text-accent hover:text-white">
            support@forth.studio
          </a>
          .
        </p>
      </div>
    </AuthShell>
  );
}
