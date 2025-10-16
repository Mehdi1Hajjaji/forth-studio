import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { fetchProblemList } from "@/lib/data";
import { SubmitForm } from "./SubmitForm";

export default async function SubmitPage() {
  let problems = [] as Awaited<ReturnType<typeof fetchProblemList>>;
  try {
    problems = await fetchProblemList();
  } catch (err) {
    problems = [];
  }

  return (
    <DashboardShell
      title="Submit a solution"
      description="Pick a challenge, write your code, and share context so mentors can review quickly."
      activePath="/submit"
      actions={
        <Link
          href="/algorithms"
          className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 transition hover:text-white"
        >
          Browse algorithms
        </Link>
      }
    >
      <SubmitForm problems={problems} />
    </DashboardShell>
  );
}
export const dynamic = 'force-dynamic';
