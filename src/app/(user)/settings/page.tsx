import { DashboardShell } from "@/components/layout/DashboardShell";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import AccountProfileForm from "./profile-form";
import AccountPasswordForm from "./password-form";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    redirect("/auth/sign-in?callbackUrl=/settings");
  }

  const [user, universities] = await Promise.all([
    prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        universityId: true,
        pronouns: true,
        bio: true,
      },
    }),
    prisma.university.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!user) {
    redirect("/auth/sign-in");
  }

  const normalizedRole = (user.role ?? "STUDENT").toLowerCase() as 'student' | 'mentor' | 'investor' | 'admin';

  return (
    <DashboardShell
      title="Account settings"
      description="Manage your profile, collaboration role, and login credentials."
      activePath="/settings"
    >
      <div className="grid gap-8">
        <AccountProfileForm
          initialRole={normalizedRole}
          initialUniversityId={user.universityId}
          initialPronouns={user.pronouns ?? ''}
          initialBio={user.bio ?? ''}
          universities={universities}
        />
        <AccountPasswordForm />
      </div>
    </DashboardShell>
  );
}
