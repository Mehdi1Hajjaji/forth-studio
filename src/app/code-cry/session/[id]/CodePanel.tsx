"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

type Props = { sessionId: string; isHost: boolean };

export default function CodePanel({ sessionId, isHost }: Props) {
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('plaintext');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const lastUpdateRef = useRef<string>('');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/code-cry/session/${sessionId}/code`, { cache: 'no-store' });
    setLoading(false);
    if (!res.ok) return;
    const data = await res.json();
    setContent(data?.data?.content ?? '');
    setLanguage(data?.data?.language ?? 'plaintext');
    lastUpdateRef.current = data?.data?.updatedAt ?? '';
  }, [sessionId]);

  useEffect(() => {
    load();
    const es = new EventSource(`/api/code-cry/session/${sessionId}/events/code`);
    es.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg?.type === 'code' && msg?.data?.updatedAt && msg.data.updatedAt !== lastUpdateRef.current) {
          lastUpdateRef.current = msg.data.updatedAt;
          setContent(msg.data.content ?? '');
          setLanguage(msg.data.language ?? 'plaintext');
        }
      } catch { /* ignore */ }
    };
    es.onerror = () => { es.close(); };
    return () => es.close();
  }, [sessionId, load]);

  const canEdit = isHost;

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/code-cry/session/${sessionId}/code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, language }),
    });
    setSaving(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err?.error || 'Failed to publish code');
    }
  }

  const languages = useMemo(() => [
    'plaintext', 'javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'go', 'rust', 'json', 'markdown', 'sql', 'html', 'css'
  ], []);

  return (
    <div className="flex h-full flex-col border-t">
      <div className="flex items-center justify-between border-b p-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="font-medium">Code Preview</div>
          <select
            className="rounded border px-2 py-1"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={!canEdit}
          >
            {languages.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        {canEdit && (
          <button className="rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-50" disabled={saving} onClick={save}>
            {saving ? 'Publishing…' : 'Publish'}
          </button>
        )}
      </div>
      <div className="flex-1">
        <Editor height="100%" defaultLanguage={language} language={language} theme="vs-dark" value={content} onChange={(v) => canEdit ? setContent(v ?? '') : undefined} options={{ readOnly: !canEdit, minimap: { enabled: false } }} />
      </div>
    </div>
  );
}
