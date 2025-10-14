import type { Metadata } from "next";
import { SignInForm } from "./SignInForm";

export const metadata: Metadata = {
  title: "Sign in – forth.studio",
};

export default function SignInPage() {
  return <SignInForm />;
}

