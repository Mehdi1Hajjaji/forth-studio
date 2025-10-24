/**
 * LiveKit helpers: server-side token generation and basic guards.
 * Requires env: LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET
 */
import { AccessToken } from 'livekit-server-sdk';

export type LiveKitRole = 'publisher' | 'subscriber';

export function ensureLiveKitEnv() {
  const url = process.env.LIVEKIT_URL;
  const key = process.env.LIVEKIT_API_KEY;
  const secret = process.env.LIVEKIT_API_SECRET;
  if (!url || !key || !secret) {
    throw new Error('LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET must be set');
  }
  return { url, key, secret };
}

export async function createJoinToken(params: {
  roomName: string;
  identity: string; // unique per user; anonymous participants can use a random identity
  name?: string; // display name
  role: LiveKitRole;
}) {
  const { key, secret } = ensureLiveKitEnv();
  const at = new AccessToken(key, secret, {
    identity: params.identity,
    name: params.name,
  });
  at.addGrant({
    room: params.roomName,
    roomJoin: true,
    canPublish: params.role === 'publisher',
    canSubscribe: true,
    canPublishData: true,
  });
  return await at.toJwt();
}
