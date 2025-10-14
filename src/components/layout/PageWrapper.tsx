import type { ReactNode } from "react";
import { TopNav } from "@/components/site/TopNav";

type PageWrapperProps = {
  children: ReactNode;
  inset?: boolean;
};

export function PageWrapper({ children, inset = false }: PageWrapperProps) {
  return (
    <div className="min-h-screen bg-background text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-x-0 -top-32 h-64 bg-hero-glow blur-3xl" />
        <div
          className={`mx-auto flex min-h-screen flex-col px-6 pb-16 pt-10 lg:px-8 ${
            inset ? "max-w-6xl" : "max-w-7xl"
          }`}
        >
          <TopNav />
          <main className="mt-12 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
