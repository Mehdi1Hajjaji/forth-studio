"use client";

import { useState } from 'react';

export default function CodeCryCreateForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [isAnon, setIsAnon] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    const payload: any = { title, description: description || undefined, isAnonymous: isAnon };
    if (scheduledFor) payload.scheduledFor = new Date(scheduledFor).toISOString();
    const res = await fetch('/api/code-cry/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setCreatedId(data?.data?.id ?? null);
    } else {
      alert(data?.error || 'Failed to create session');
    }
  }

  return (
    <div className="rounded-2xl border border-border/45 bg-surface/80 p-4">
      <div className="mb-3 text-sm font-semibold">Create a Code & Cry Session</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input className="rounded border px-3 py-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="rounded border px-3 py-2" placeholder="When (local time)" type="datetime-local" value={scheduledFor} onChange={(e) => setScheduledFor(e.target.value)} />
        <textarea className="sm:col-span-2 rounded border px-3 py-2" rows={3} placeholder="Short description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isAnon} onChange={(e) => setIsAnon(e.target.checked)} />
          Enable anonymous participation
        </label>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button className="pill-button pill-button--primary" disabled={loading || title.trim().length < 3} onClick={submit}>
          {loading ? 'Creating…' : 'Create session'}
        </button>
        {createdId && (
          <a href={`/code-cry/session/${createdId}`} className="text-sm text-accent hover:underline">Open session</a>
        )}
      </div>
    </div>
  );
}

