import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import SignUpFormSimple from "./SignUpFormSimple";

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
      subtitle="Create an account with your email to post stories, solve challenges and share best solutions."
      alternateAction={{
        label: "Already have an account?",
        linkLabel: "Sign in",
        href: "/auth/sign-in",
      }}
    >
      <SignUpFormSimple />
    </AuthShell>
  );
}

// Removed the previous long form for a simpler, email/password-only flow.
