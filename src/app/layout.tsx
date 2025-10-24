import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

const space_grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "forth.studio — Advance Your Code",
  description:
    "Algorithm-driven campus community: daily challenges, curated stories, and peer-reviewed projects to accelerate your engineering journey.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${space_grotesk.variable} font-sans bg-background`}>
        <AppProviders>{children}</AppProviders>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
