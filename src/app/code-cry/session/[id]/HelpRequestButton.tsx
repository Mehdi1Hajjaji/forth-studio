"use client";

import { useState } from 'react';

export default function HelpRequestButton({ sessionId }: { sessionId: string }) {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [details, setDetails] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    const payload: any = { topic, details, isAnonymous, requesterName: displayName || undefined };
    const res = await fetch(`/api/code-cry/session/${sessionId}/help-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (res.ok) {
      setOpen(false);
      setTopic('');
      setDetails('');
      setDisplayName('');
      alert('Help request sent');
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err?.error || 'Failed to send help request');
    }
  }

  return (
    <div>
      <button
        className="rounded border px-2 py-1 text-sm hover:bg-muted"
        onClick={() => setOpen(true)}
      >
        Ask for help
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded bg-white p-4 shadow">
            <div className="mb-3 text-lg font-semibold">Ask for Help</div>
            <div className="space-y-2">
              <input
                className="w-full rounded border px-2 py-1"
                placeholder="Topic (e.g., 'TypeScript type error in X')"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <textarea
                className="w-full rounded border px-2 py-1"
                rows={4}
                placeholder="Details (what are you trying, what fails, etc.)"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
              <div className="flex items-center gap-2 text-sm">
                <label className="inline-flex items-center gap-1">
                  <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
                  <span>Anonymous</span>
                </label>
                {isAnonymous && (
                  <input
                    className="flex-1 rounded border px-2 py-1"
                    placeholder="Display name (optional)"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                )}
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="rounded border px-3 py-1" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button
                className="rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-50"
                disabled={topic.trim().length < 3 || loading}
                onClick={submit}
              >
                {loading ? 'Sending…' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

