export type GalaxyThemeName = 'nebula-blue' | 'quantum-gold' | 'solar-emerald' | 'dark-void';

export type GalaxyConfig = {
  name: GalaxyThemeName;
  colors: {
    bgFrom: string;
    bgTo: string;
    star: string;
    glow: string;
    accent: string;
  };
  density: number; // 0.0–1.0, controls star count
  twinkle: number; // 0.0–1.0, intensity of twinkle
  halo: boolean;   // show subtle moving halo for high activity
  comets: number;  // 0–3 decorative comets
};

const LANG_HUES: Record<string, number> = {
  javascript: 50, // gold
  typescript: 220, // azure
  python: 195, // teal/azure
  'c++': 210, // blue
  c: 210,
  java: 18, // orange-red
  go: 190, // teal
  rust: 28, // amber
  default: 260, // purple
};

function hueForLanguage(lang: string | undefined) {
  if (!lang) return LANG_HUES.default;
  const key = lang.toLowerCase();
  return LANG_HUES[key] ?? LANG_HUES.default;
}

export function deriveGalaxyTheme(params: {
  languages: Record<string, number>;
  xp: number;
  resilienceBadgeCount?: number | null;
  karma?: number;
  recentActivityScore: number; // weighted sum of last-7-day events
}): GalaxyConfig {
  const { languages, xp, resilienceBadgeCount, karma = 0, recentActivityScore } = params;
  const topLang = Object.keys(languages).sort((a, b) => (languages[b] ?? 0) - (languages[a] ?? 0))[0];
  const baseHue = hueForLanguage(topLang);
  const badges = (resilienceBadgeCount ?? 0);
  // Simple scoring heuristic: adjustable later
  const score = Math.round(xp / 100) + badges + Math.round(karma / 5) + Math.min(10, recentActivityScore);

  let name: GalaxyThemeName = 'dark-void';
  if (score >= 15) name = 'quantum-gold';
  else if (score >= 9) name = 'solar-emerald';
  else if (score >= 5) name = 'nebula-blue';

  // Compute palette from hue and theme name
  function hsl(h: number, s: number, l: number) { return `hsl(${h} ${s}% ${l}%)`; }
  const accentHue = (name === 'quantum-gold') ? 45 : (name === 'solar-emerald') ? 140 : (name === 'nebula-blue') ? 200 : baseHue;
  const bgFrom = (name === 'dark-void') ? hsl((baseHue + 220) % 360, 30, 6) : hsl((baseHue + 320) % 360, 60, 10);
  const bgTo   = (name === 'dark-void') ? hsl((baseHue + 260) % 360, 25, 8) : hsl((baseHue + 40) % 360, 65, 16);
  const star   = (name === 'quantum-gold') ? hsl(50, 90, 74) : (name === 'solar-emerald') ? hsl(150, 70, 70) : hsl((baseHue + 10) % 360, 70, 75);
  const glow   = (name === 'quantum-gold') ? hsl(50, 95, 60) : (name === 'solar-emerald') ? hsl(150, 85, 55) : hsl((baseHue + 20) % 360, 80, 60);
  const accent = hsl(accentHue, 85, 60);

  const density = Math.min(1, 0.25 + score / 20);
  const twinkle = Math.min(1, 0.3 + score / 30);
  const halo = recentActivityScore >= 3;
  const comets = Math.min(3, Math.floor(score / 8));

  return {
    name,
    colors: { bgFrom, bgTo, star, glow, accent },
    density,
    twinkle,
    halo,
    comets,
  };
}

