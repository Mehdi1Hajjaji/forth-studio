type SessionId = string;
type UserId = string;

type Promotion = { userId: UserId; expiresAt: number };

const globalStore = globalThis as unknown as {
  __codecry_promotions?: Map<SessionId, Promotion[]>;
};

const store = (globalStore.__codecry_promotions ??= new Map());

export function grantPublisher(sessionId: string, userId: string, ttlMs = 2 * 60 * 1000) {
  const list: Promotion[] = store.get(sessionId) ?? [];
  const expiresAt = Date.now() + ttlMs;
  const filtered: Promotion[] = list.filter((p: Promotion) => p.userId !== userId && p.expiresAt > Date.now());
  filtered.push({ userId, expiresAt });
  store.set(sessionId, filtered);
}

export function consumePublisherGrant(sessionId: string, userId: string): boolean {
  const list: Promotion[] = store.get(sessionId) ?? [];
  const now = Date.now();
  const idx = list.findIndex((p: Promotion) => p.userId === userId && p.expiresAt > now);
  if (idx === -1) return false;
  list.splice(idx, 1);
  store.set(sessionId, list);
  return true;
}
