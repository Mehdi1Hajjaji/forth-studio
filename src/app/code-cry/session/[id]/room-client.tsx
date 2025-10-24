"use client";

import { useEffect, useMemo, useState } from 'react';
import { LiveKitRoom, RoomAudioRenderer, VideoConference, useParticipants, useRoomContext } from '@livekit/components-react';
import '@livekit/components-styles';

import ChatSidebar from './sidebar';
import CodePanel from './CodePanel';

type Props = {
  sessionId: string;
  roomName: string;
  title: string;
  description: string;
  isHost: boolean;
  isLiveInitial?: boolean;
};

export default function LiveSessionClient({ sessionId, roomName, title, description, isHost, isLiveInitial = false }: Props) {
  const [joined, setJoined] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [isChatClosed, setIsChatClosed] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [isStuck, setIsStuck] = useState(false);
  const [isLive, setIsLive] = useState<boolean>(isLiveInitial);
  const [promotionPrompt, setPromotionPrompt] = useState(false);

  const [preJoinDone, setPreJoinDone] = useState(false);
  const [wantAudio, setWantAudio] = useState(true);
  const [wantVideo, setWantVideo] = useState(true);
  const canJoin = useMemo(() => Boolean(token && url) && preJoinDone, [token, url, preJoinDone]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioId, setAudioId] = useState<string>('');
  const [videoId, setVideoId] = useState<string>('');
  // Note: do not call useRoomContext() here; only inside children of LiveKitRoom

  async function fetchToken(role: 'publisher' | 'subscriber') {
    const res = await fetch(`/api/code-cry/session/${sessionId}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, isAnonymous, displayName: displayName || undefined }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || 'Failed to get token');
    }
    const data = await res.json();
    setToken(data?.data?.token);
    setUrl(data?.data?.url);
  }

  // No auto-join; fetch token on clicking "Join Room"
  useEffect(() => {
    async function enumerate() {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      } catch {}
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const aud = devices.filter((d) => d.kind === 'audioinput');
        const vid = devices.filter((d) => d.kind === 'videoinput');
        setAudioDevices(aud as any);
        setVideoDevices(vid as any);
        if (aud[0] && !audioId) setAudioId(aud[0].deviceId);
        if (vid[0] && !videoId) setVideoId(vid[0].deviceId);
      } catch {}
    }
    enumerate();
  }, []);

  useEffect(() => {
    // Subscribe to session state events (toggles + live status)
    const es = new EventSource(`/api/code-cry/session/${sessionId}/events/state`);
    es.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg?.type === 'state' && msg?.data) {
          if (typeof msg.data.isChatClosed === 'boolean') setIsChatClosed(msg.data.isChatClosed);
          if (typeof msg.data.isViewOnly === 'boolean') setIsViewOnly(msg.data.isViewOnly);
          if (typeof msg.data.isStuck === 'boolean') setIsStuck(msg.data.isStuck);
          if (typeof msg.data.isLive === 'boolean') setIsLive(msg.data.isLive);
        }
      } catch {}
    };
    es.onerror = () => { es.close(); };
    return () => es.close();
  }, [sessionId]);

  // data events subscription is handled inside LiveKitRoom via DataEventBridge

  return (
    <div className="grid h-full grid-cols-1 md:grid-cols-[1fr_360px]">
      <div className="flex flex-col">
        <div className="border-b p-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h1 className="text-lg font-semibold">{title}</h1>
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            <button
              className="rounded border px-2 py-1 text-xs hover:bg-muted"
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href).then(() => {
                  // no-op toast; minimal UI
                }).catch(() => {});
              }}
            >Copy link</button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
              <span>Join anonymously</span>
            </label>
            {isAnonymous && (
              <input
                className="rounded border px-2 py-1 text-sm"
                placeholder="Display name (optional)"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            )}
            {isHost && (
              <>
                <span className="mx-2 hidden h-4 w-px bg-border md:inline-block" />
                {!isLive ? (
                  <button
                    className="rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700"
                    onClick={async () => {
                      const res = await fetch(`/api/code-cry/session/${sessionId}/start`, { method: 'POST' });
                      if (res.ok) setIsLive(true);
                    }}
                  >Start</button>
                ) : (
                  <button
                    className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                    onClick={async () => {
                      const res = await fetch(`/api/code-cry/session/${sessionId}/end`, { method: 'POST' });
                      if (res.ok) setIsLive(false);
                    }}
                  >End</button>
                )}
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={isChatClosed} onChange={async (e) => {
                    setIsChatClosed(e.target.checked);
                    await fetch(`/api/code-cry/session/${sessionId}/moderation/settings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isChatClosed: e.target.checked }) });
                  }} />
                  <span>Close chat</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={isViewOnly} onChange={async (e) => {
                    setIsViewOnly(e.target.checked);
                    await fetch(`/api/code-cry/session/${sessionId}/moderation/settings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isViewOnly: e.target.checked }) });
                  }} />
                  <span>View only</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={isStuck} onChange={async (e) => {
                    setIsStuck(e.target.checked);
                    await fetch(`/api/code-cry/session/${sessionId}/moderation/settings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isStuck: e.target.checked }) });
                  }} />
                  <span>I&apos;m stuck</span>
                </label>
              </>
            )}
          </div>
        </div>

        {!canJoin ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="w-full max-w-xl space-y-3 rounded border p-4">
              <div className="text-lg font-semibold">Join Session</div>
              <div className="text-sm text-muted-foreground">Choose how you want to join.</div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
                  <span>Join anonymously</span>
                </label>
                {isAnonymous && (
                  <input
                    className="rounded border px-2 py-1 text-sm"
                    placeholder="Display name (optional)"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                )}
                <span className="mx-2 hidden h-4 w-px bg-border md:inline-block" />
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={wantAudio} onChange={(e) => setWantAudio(e.target.checked)} />
                  <span>Mic on</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={wantVideo} onChange={(e) => setWantVideo(e.target.checked)} />
                  <span>Camera on</span>
                </label>
                <div className="flex w-full flex-wrap gap-2">
                  <select className="min-w-[200px] rounded border px-2 py-1 text-sm" value={audioId} onChange={(e) => setAudioId(e.target.value)}>
                    {audioDevices.map((d) => <option key={d.deviceId} value={d.deviceId}>{d.label || 'Microphone'}</option>)}
                  </select>
                  <select className="min-w-[200px] rounded border px-2 py-1 text-sm" value={videoId} onChange={(e) => setVideoId(e.target.value)}>
                    {videoDevices.map((d) => <option key={d.deviceId} value={d.deviceId}>{d.label || 'Camera'}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="rounded bg-blue-600 px-3 py-1 text-white"
                  onClick={async () => {
                    // prime devices if chosen
                    try {
                      if (wantAudio || wantVideo) {
                        await navigator.mediaDevices.getUserMedia({ audio: wantAudio ? { deviceId: audioId || undefined } : false, video: wantVideo ? { deviceId: videoId || undefined } : false });
                      }
                    } catch {}
                    await fetchToken(isHost ? 'publisher' : 'subscriber');
                    setPreJoinDone(true);
                  }}
                >Join Room</button>
                {!isHost && promotionPrompt && (
                  <button
                    className="rounded border px-3 py-1"
                    onClick={async () => {
                      setPreJoinDone(false);
                      await fetchToken('publisher');
                      setPreJoinDone(true);
                      setPromotionPrompt(false);
                    }}
                  >Go on Stage</button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <LiveKitRoom
            token={token!}
            serverUrl={url!}
            connect={true}
            audio={wantAudio}
            video={wantVideo}
            onConnected={() => setJoined(true)}
            onDisconnected={() => setJoined(false)}
            className="grid h-full grid-cols-1 md:grid-cols-[1fr_360px]"
          >
            <DataEventBridge onPromoted={() => { if (!isHost) setPromotionPrompt(true); }} />
            <RoomAudioRenderer />
            <div className="grid flex-1 grid-rows-2 overflow-hidden">
              <div className="min-h-0 overflow-hidden">
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between border-b p-2 text-xs text-muted-foreground">
                    <ParticipantsIndicator />
                  </div>
                  <div className={`min-h-0 flex-1 overflow-hidden ${isStuck ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-background' : ''}`}>
                    <VideoConference />
                  </div>
                </div>
              </div>
              <div className="min-h-0 overflow-hidden">
                <CodePanel sessionId={sessionId} isHost={isHost} />
              </div>
            </div>
            <ChatSidebar sessionId={sessionId} isHost={isHost} />
          </LiveKitRoom>
        )}
      </div>
    </div>
  );
}

function DataEventBridge({ onPromoted }: { onPromoted: () => void }) {
  const room = useRoomContext();
  useEffect(() => {
    const onData = (payload: Uint8Array) => {
      try {
        const text = new TextDecoder().decode(payload);
        const evt = JSON.parse(text);
        if (evt?.type === 'promoted') {
          onPromoted();
        }
      } catch {}
    };
    room?.on?.('dataReceived', onData);
    return () => { room?.off?.('dataReceived', onData); };
  }, [room, onPromoted]);
  return null;
}

function ParticipantsIndicator() {
  const participants = useParticipants();
  const count = participants.length;
  const names = participants.slice(0, 5).map((p) => p.name || p.identity);
  return (
    <div className="flex items-center gap-2">
      <span>Participants: {count}</span>
      <span className="hidden gap-1 md:inline-flex">
        {names.map((n) => (
          <span key={n} className="rounded bg-muted px-2 py-0.5">{n}</span>
        ))}
      </span>
    </div>
  );
}
