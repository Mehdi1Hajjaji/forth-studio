"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import type { GalaxyConfig } from '@/lib/galaxy-theme';

export default function GalaxyCover({ config, explanation }: { config: GalaxyConfig; explanation: string[] }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const starCount = useMemo(() => {
    return Math.round(120 + config.density * 180);
  }, [config.density]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const maybe = canvas.getContext('2d');
    if (!maybe) return;
    const context = maybe as CanvasRenderingContext2D;

    let raf = 0;
    function resize(c: HTMLCanvasElement) {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = c.clientWidth;
      const h = Math.max(160, c.clientHeight);
      c.width = Math.floor(w * dpr);
      c.height = Math.floor(h * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    const onResize = () => resize(canvas as HTMLCanvasElement);
    window.addEventListener('resize', onResize);
    resize(canvas);

    type Star = { x: number; y: number; r: number; tw: number; sp: number };
    const stars: Star[] = [];
    function init(c: HTMLCanvasElement) {
      stars.length = 0;
      const w = c.clientWidth, h = c.clientHeight;
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.6 + 0.2,
          tw: Math.random() * config.twinkle + 0.2,
          sp: (Math.random() * 0.2 + 0.05) * (config.halo ? 1.3 : 1),
        });
      }
    }
    init(canvas as HTMLCanvasElement);

    function drawBackground(w: number, h: number) {
      const grd = context.createLinearGradient(0, 0, w, h);
      grd.addColorStop(0, config.colors.bgFrom);
      grd.addColorStop(1, config.colors.bgTo);
      context.fillStyle = grd as any;
      context.fillRect(0, 0, w, h);
      // subtle vignette
      const rad = context.createRadialGradient(w * 0.6, h * 0.3, 10, w * 0.6, h * 0.3, Math.max(w, h));
      rad.addColorStop(0, 'transparent');
      rad.addColorStop(1, 'rgba(0,0,0,0.35)');
      context.fillStyle = rad as any;
      context.fillRect(0, 0, w, h);
    }

    function draw(c: HTMLCanvasElement) {
      const w = c.clientWidth, h = c.clientHeight;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, w, h);
      drawBackground(w, h);

      // stars
      for (const s of stars) {
        const alpha = Math.max(0.2, Math.abs(Math.sin((Date.now() * 0.001 * s.tw) + s.x)));
        context.beginPath();
        context.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        context.fillStyle = withAlpha(config.colors.star, alpha);
        context.fill();
        // glow
        context.shadowColor = withAlpha(config.colors.glow, 0.35 * alpha);
        context.shadowBlur = 8;
        context.fill();
        context.shadowBlur = 0;
      }

      // subtle drift
      for (const s of stars) {
        s.x += s.sp * 0.2; if (s.x > w) s.x = 0;
        s.y += s.sp * 0.05; if (s.y > h) s.y = 0;
      }

      // halo sweep for activity
      if (config.halo) {
        const t = (Date.now() % 4000) / 4000;
        const cx = w * (0.15 + 0.7 * t);
        const cy = h * 0.4;
        const grad = context.createRadialGradient(cx, cy, 10, cx, cy, 180);
        grad.addColorStop(0, withAlpha(config.colors.accent, 0.18));
        grad.addColorStop(1, 'transparent');
        context.fillStyle = grad as any;
        context.beginPath();
        context.arc(cx, cy, 200, 0, Math.PI * 2);
        context.fill();
      }

      raf = requestAnimationFrame(loop);
    }
    function loop() { draw(canvas as HTMLCanvasElement); }
    loop();

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, [config, starCount]);

  return (
    <div className="relative h-40 w-full overflow-hidden rounded-t-3xl">
      <canvas ref={canvasRef} className="h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
      <button
        className="absolute right-3 top-3 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-xs text-white backdrop-blur hover:border-white/40"
        onClick={() => setShowInfo((v) => !v)}
      >
        Why this galaxy?
      </button>
      {showInfo ? (
        <div className="absolute right-3 top-10 max-w-md rounded-2xl border border-white/15 bg-black/60 p-3 text-xs text-white/80 shadow">
          <ul className="list-disc pl-4">
            {explanation.map((line, i) => (<li key={i}>{line}</li>))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function withAlpha(hsl: string, alpha: number) {
  // hsl(…%) to hsla string
  return hsl.replace('hsl', 'hsla').replace(')', ` / ${alpha})`);
}
