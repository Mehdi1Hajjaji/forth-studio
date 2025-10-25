import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SuggestionsAdminPage() {
  await requireAdmin();
  const rows = await prisma.challengeSuggestion.findMany({
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    include: { createdBy: { select: { username: true, name: true } } },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Challenge Suggestions</h1>
        <p className="text-sm text-muted-foreground">Admin-only inbox of community submissions.</p>
      </header>
      <div className="rounded-2xl border border-white/10 bg-white/5">
        <table className="w-full text-sm">
          <thead className="text-left text-white/70">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Topic</th>
              <th className="px-4 py-3">Difficulty</th>
              <th className="px-4 py-3">By</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-t border-white/10 align-top">
                <td className="px-4 py-3">
                  <div className="font-medium text-white">{s.title}</div>
                  <div className="text-white/70">{s.details.slice(0, 160)}{s.details.length > 160 ? '…' : ''}</div>
                </td>
                <td className="px-4 py-3">{s.topic}</td>
                <td className="px-4 py-3">{s.difficulty}</td>
                <td className="px-4 py-3">{s.createdBy.name ?? s.createdBy.username}</td>
                <td className="px-4 py-3">{s.createdAt.toLocaleString()}</td>
                <td className="px-4 py-3">{s.status}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <AdminAction id={s.id} status="APPROVED" label="Approve" />
                    <AdminAction id={s.id} status="REJECTED" label="Reject" />
                    <AdminAction id={s.id} status="PENDING" label="Reset" />
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-white/70" colSpan={7}>No suggestions yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <footer className="mt-6 text-sm text-white/60">
        <Link href="/" className="hover:text-white">Back home</Link>
      </footer>
    </div>
  );
}

function AdminAction({ id, status, label }: { id: string; status: 'APPROVED'|'REJECTED'|'PENDING'; label: string }) {
  async function onClick() {
    try {
      await fetch(`/api/admin/challenge-suggestions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      // naive refresh
      location.reload();
    } catch {}
  }
  return (
    <button onClick={onClick} className="rounded border border-white/15 px-3 py-1 text-xs hover:border-accent/40 hover:text-white">{label}</button>
  );
}

