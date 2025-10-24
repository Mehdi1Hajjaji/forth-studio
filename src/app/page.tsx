import { TopNav } from "@/components/site/TopNav";
import { LandingHero } from "@/components/landing/LandingHero";

export default async function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />
      <LandingHero />
    </div>
  );
}

export const dynamic = "force-dynamic";
