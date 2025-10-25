export function coverStyleFor(username: string) {
  // Deterministic gradient based on username hash
  const hash = Array.from(username).reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
  const hue1 = Math.abs(hash) % 360;
  const hue2 = (hue1 + 60) % 360;
  const from = `hsl(${hue1} 70% 14%)`;
  const to = `hsl(${hue2} 80% 20%)`;
  return { background: `linear-gradient(120deg, ${from}, ${to})` } as React.CSSProperties;
}

export function badgesForUser(user: { resilienceBadgeCount?: number | null; xp?: number | null }) {
  const badges: string[] = [];
  if ((user.resilienceBadgeCount ?? 0) > 0) badges.push(`Resilience x${user.resilienceBadgeCount}`);
  if ((user.xp ?? 0) >= 100) badges.push('Centurion');
  return badges;
}
import type React from 'react';
