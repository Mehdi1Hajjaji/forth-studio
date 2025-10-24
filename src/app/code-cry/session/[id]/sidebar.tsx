"use client";

import { useEffect, useRef, useState } from 'react';
import { useRoomContext } from '@livekit/components-react';
import HelpRequestButton from './HelpRequestButton';

type Message = {
  id: string;
  senderId?: string | null;
  senderName: string | null;
  message: string;
  isAnonymous: boolean;
  sentAt: string;
  upvotes?: number;
};

export default function ChatSidebar({ sessionId, isHost }: { sessionId: string; isHost?: boolean }) {
  const room = useRoomContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const [moderateId, setModerateId] = useState('');
  const [helpOpen, setHelpOpen] = useState<any[]>([]);
  const [typing, setTyping] = useState<Record<string, number>>({});
  const [modOpen, setModOpen] = useState(false);
  const [muteList, setMuteList] = useState<any[]>([]);
  const [banList, setBanList] = useState<any[]>([]);
  const [hands, setHands] = useState<Array<{ id: string; name: string }>>([]);

  async function load() {
    const res = await fetch(`/api/code-cry/session/${sessionId}/messages`, { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    setMessages(data?.data ?? []);
  }

  async function send() {
    const payload: any = { message: input, isAnonymous };
    if (isAnonymous && displayName) payload.senderName = displayName;
    const res = await fetch(`/api/code-cry/session/${sessionId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setInput('');
      await load();
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
      try {
        // Broadcast via LiveKit data channel for instant updates
        const body = await res.json();
        const msg = body?.data;
        const enc = new TextEncoder();
        room?.localParticipant?.publishData(enc.encode(JSON.stringify({ type: 'chat', data: msg })), { reliable: true });
      } catch {}
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err?.error || 'Failed to send message');
    }
  }

  useEffect(() => {
    load();
    // Live updates via SSE (fallback / join history)
    const since = new Date().toISOString();
    const es = new EventSource(`/api/code-cry/session/${sessionId}/events/chat?since=${encodeURIComponent(since)}`);
    es.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg?.type === 'message' && msg?.data) {
          setMessages((prev) => {
            const idx = prev.findIndex((m) => m.id === msg.data.id);
            if (idx >= 0) {
              const clone = prev.slice();
              clone[idx] = { ...clone[idx], ...msg.data };
              return clone;
            }
            return [...prev, msg.data];
          });
          listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
        }
      } catch {}
    };
    es.onerror = () => { es.close(); };
    const helpEs = new EventSource(`/api/code-cry/session/${sessionId}/events/help`);
    helpEs.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg?.type === 'help' && msg?.data) {
          setHelpOpen((prev) => [...prev, msg.data]);
        }
      } catch {}
    };
    helpEs.onerror = () => { helpEs.close(); };
    // LiveKit data channel events
    const onData = (payload: Uint8Array, participant: any, _kind: any) => {
      try {
        const text = new TextDecoder().decode(payload);
        const evt = JSON.parse(text);
        if (evt?.type === 'chat' && evt?.data) {
          setMessages((prev) => {
            const idx = prev.findIndex((m) => m.id === evt.data.id);
            if (idx >= 0) {
              const clone = prev.slice();
              clone[idx] = { ...clone[idx], ...evt.data };
              return clone;
            }
            return [...prev, evt.data];
          });
        } else if (evt?.type === 'typing' && evt?.userId) {
          setTyping((prev) => ({ ...prev, [evt.userId]: Date.now() + 2000 }));
        } else if (evt?.type === 'hand' && evt?.userId && isHost) {
          setHands((prev) => {
            if (prev.some((h) => h.id === evt.userId)) return prev;
            return [...prev, { id: evt.userId, name: evt.name || participant?.name || 'Viewer' }];
          });
        }
      } catch {}
    };
    room?.on('dataReceived', onData);

    const gc = setInterval(() => {
      const now = Date.now();
      setTyping((prev) => {
        const next: Record<string, number> = {};
        for (const [k, v] of Object.entries(prev)) if (v > now) next[k] = v;
        return next;
      });
    }, 1000);

    return () => { es.close(); helpEs.close(); room?.off('dataReceived', onData); clearInterval(gc); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <aside className="flex h-full flex-col border-l">
      <div className="border-b p-3">
        <div className="flex items-center justify-between">
          <div className="font-medium">Chat</div>
          <div className="flex items-center gap-2">
            {Object.keys(typing).length > 0 && (
              <div className="text-xs text-muted-foreground">Someone is typing…</div>
            )}
            {!isHost && (
              <button
                className="rounded border px-2 py-1 text-xs hover:bg-muted"
                onClick={() => {
                  try {
                    const id = room?.localParticipant?.identity || 'unknown';
                    const name = room?.localParticipant?.name || 'Viewer';
                    const enc = new TextEncoder();
                    room?.localParticipant?.publishData(enc.encode(JSON.stringify({ type: 'hand', userId: id, name })), { reliable: true });
                  } catch {}
                }}
              >Raise hand</button>
            )}
            {isHost && (
              <button className="rounded border px-2 py-1 text-xs hover:bg-muted" onClick={async () => {
                const res = await fetch(`/api/code-cry/session/${sessionId}/moderation/list`);
                if (res.ok) {
                  const data = await res.json();
                  setMuteList(data.mutes ?? []);
                  setBanList(data.bans ?? []);
                  setModOpen(true);
                }
              }}>Moderation</button>
            )}
            <HelpRequestButton sessionId={sessionId} />
          </div>
        </div>
        {isHost && (
          <div className="mt-2 text-xs">
            <div className="mb-1 font-semibold">Hands</div>
            {hands.length === 0 ? (
              <div className="text-muted-foreground">No hands raised</div>
            ) : (
              <ul className="space-y-1">
                {hands.map((h) => (
                  <li key={h.id} className="flex items-center justify-between rounded bg-muted px-2 py-1">
                    <div className="font-medium">{h.name}</div>
                    <div className="flex items-center gap-1">
                      <button
                        className="rounded border px-2 py-0.5 text-xs hover:bg-white/40"
                        onClick={async () => {
                          const res = await fetch(`/api/code-cry/session/${sessionId}/promote`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: h.id }) });
                          if (res.ok) {
                            try {
                              const enc = new TextEncoder();
                              // Notify the specific identity that they were promoted
                              (room as any)?.localParticipant?.publishData(enc.encode(JSON.stringify({ type: 'promoted' })), { reliable: true, destination: [h.id] });
                            } catch {}
                          }
                          setHands((prev) => prev.filter((x) => x.id !== h.id));
                        }}
                      >Accept</button>
                      <button
                        className="rounded border px-2 py-0.5 text-xs hover:bg-white/40"
                        onClick={() => setHands((prev) => prev.filter((x) => x.id !== h.id))}
                      >Dismiss</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {isHost && (
          <div className="mt-2 text-xs">
            <div className="mb-1 font-semibold">Help Requests</div>
            {helpOpen.length === 0 ? (
              <div className="text-muted-foreground">No open requests</div>
            ) : (
              <ul className="space-y-1">
                {helpOpen.map((h) => (
                  <li key={h.id} className="flex items-center justify-between rounded bg-muted px-2 py-1">
                    <div>
                      <div className="font-medium">{h.topic}</div>
                      <div className="text-[11px] text-muted-foreground">{h.requesterName || (h.isAnonymous ? 'Anonymous' : 'User')}</div>
                    </div>
                    <button
                      className="rounded border px-2 py-0.5 text-xs hover:bg-white/40"
                      onClick={async () => {
                        await fetch(`/api/code-cry/session/${sessionId}/help-request/${h.id}/resolve`, { method: 'POST' });
                        setHelpOpen((prev) => prev.filter((x) => x.id !== h.id));
                      }}
                    >Resolve</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {isHost && (
          <div className="mt-2 flex items-center gap-2 text-xs">
            <input className="flex-1 rounded border px-2 py-1" placeholder="User ID to moderate" value={moderateId} onChange={(e) => setModerateId(e.target.value)} />
            <button className="rounded border px-2 py-1" onClick={async () => { await fetch(`/api/code-cry/session/${sessionId}/moderation/mute`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: moderateId }) }); }}>Mute</button>
            <button className="rounded border px-2 py-1" onClick={async () => { await fetch(`/api/code-cry/session/${sessionId}/moderation/mute?userId=${encodeURIComponent(moderateId)}`, { method: 'DELETE' }); }}>Unmute</button>
            <button className="rounded border px-2 py-1" onClick={async () => { await fetch(`/api/code-cry/session/${sessionId}/moderation/ban`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: moderateId }) }); }}>Ban</button>
            <button className="rounded border px-2 py-1" onClick={async () => { await fetch(`/api/code-cry/session/${sessionId}/moderation/ban?userId=${encodeURIComponent(moderateId)}`, { method: 'DELETE' }); }}>Unban</button>
          </div>
        )}
      </div>
      <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto p-3">
        {messages.map((m) => (
          <div key={m.id} className="rounded bg-muted p-2 text-sm">
            <div className="mb-1 text-xs text-muted-foreground">
              {m.isAnonymous ? (m.senderName || 'Anonymous') : (m.senderName || 'User')} · {new Date(m.sentAt).toLocaleTimeString()}
            </div>
            <div className="flex items-start justify-between gap-2">
              <div>{m.message}</div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">{(m as any).upvotes ?? 0}</span>
                <button
                  className="rounded border px-2 py-0.5 text-xs hover:bg-white/40"
                  onClick={async () => {
                    await fetch(`/api/code-cry/session/${sessionId}/messages/${m.id}/vote`, { method: 'POST' });
                    setMessages((prev) => prev.map((x) => x.id === m.id ? { ...x, upvotes: (x.upvotes ?? 0) + 1 } : x));
                  }}
                >▲</button>
                {isHost && m.senderId ? (
                  <>
                    <button
                      className="rounded border px-2 py-0.5 text-xs hover:bg-white/40"
                      title="Mute"
                      onClick={async () => {
                        await fetch(`/api/code-cry/session/${sessionId}/moderation/mute`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: m.senderId }) });
                      }}
                    >Mute</button>
                    <button
                      className="rounded border px-2 py-0.5 text-xs hover:bg-white/40"
                      title="Ban"
                      onClick={async () => {
                        await fetch(`/api/code-cry/session/${sessionId}/moderation/ban`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: m.senderId }) });
                      }}
                    >Ban</button>
                    <button
                      className="rounded border px-2 py-0.5 text-xs hover:bg-white/40"
                      title="Promote to stage"
                      onClick={async () => {
                        await fetch(`/api/code-cry/session/${sessionId}/promote`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: m.senderId }) });
                        try { (window as any).livekitStageSpotlight = m.senderId; } catch {}
                      }}
                    >Promote</button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t p-2">
        <div className="mb-2 flex items-center gap-2 text-xs">
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
        <div className="flex gap-2">
          <input
            className="flex-1 rounded border px-2 py-1"
            placeholder="Type a message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && input.trim().length > 0) send();
            }}
            onInput={() => {
              const id = 'self';
              try { const enc = new TextEncoder(); room?.localParticipant?.publishData(enc.encode(JSON.stringify({ type: 'typing', userId: id })), { reliable: false }); } catch {}
            }}
          />
          <button
            className="rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-50"
            disabled={input.trim().length === 0}
            onClick={send}
          >
            Send
          </button>
        </div>
      </div>

      {modOpen && isHost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded bg-white p-4 shadow">
            <div className="mb-3 text-lg font-semibold">Moderation</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="mb-1 text-sm font-semibold">Muted</div>
                <ul className="space-y-1 text-sm">
                  {muteList.length === 0 ? <li className="text-muted-foreground">None</li> : muteList.map((m) => (
                    <li key={m.userId} className="flex items-center justify-between rounded border px-2 py-1">
                      <span>{m.userId}</span>
                      <button className="rounded border px-2 py-0.5 text-xs" onClick={async () => {
                        await fetch(`/api/code-cry/session/${sessionId}/moderation/mute?userId=${encodeURIComponent(m.userId)}`, { method: 'DELETE' });
                        setMuteList((prev) => prev.filter((x) => x.userId !== m.userId));
                      }}>Unmute</button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="mb-1 text-sm font-semibold">Banned</div>
                <ul className="space-y-1 text-sm">
                  {banList.length === 0 ? <li className="text-muted-foreground">None</li> : banList.map((b) => (
                    <li key={b.userId} className="flex items-center justify-between rounded border px-2 py-1">
                      <span>{b.userId}</span>
                      <button className="rounded border px-2 py-0.5 text-xs" onClick={async () => {
                        await fetch(`/api/code-cry/session/${sessionId}/moderation/ban?userId=${encodeURIComponent(b.userId)}`, { method: 'DELETE' });
                        setBanList((prev) => prev.filter((x) => x.userId !== b.userId));
                      }}>Unban</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button className="rounded border px-3 py-1" onClick={() => setModOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
