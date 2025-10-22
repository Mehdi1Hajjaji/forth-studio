'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

type SplashIntroProps = {
  imageSrc?: string; // path under /public
  durationMs?: number; // total time before reveal
};

// Fullscreen splash that plays once (per tab) then reveals the page
export function SplashIntro({ imageSrc = '/splash.jpg', durationMs = 1800 }: SplashIntroProps) {
  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return !sessionStorage.getItem('fs_splash_seen');
    } catch {
      return true;
    }
  });

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!visible) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      try { sessionStorage.setItem('fs_splash_seen', '1'); } catch {}
      setVisible(false);
      return;
    }
    const wrap = wrapRef.current!;
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    const restoreOverflow = () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    tl.fromTo(
      bgRef.current,
      { scale: 1.06, autoAlpha: 0 },
      { scale: 1, autoAlpha: 1, duration: 1.0 }
    )
      .fromTo(logoRef.current, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.8 }, '-=0.5')
      .to(wrap, {
        yPercent: -100,
        duration: 0.9,
        ease: 'power4.inOut',
        delay: Math.max(0, (durationMs - 1200) / 1000),
        onComplete: () => {
          setVisible(false);
          try { sessionStorage.setItem('fs_splash_seen', '1'); } catch {}
          restoreOverflow();
        },
      });

    return () => {
      tl.kill();
      restoreOverflow();
    };
  }, [visible, durationMs]);

  if (!visible) return null;

  return (
    <div
      ref={wrapRef}
      className="fixed inset-0 z-[1000] overflow-hidden bg-black"
      aria-hidden
    >
      <div
        ref={bgRef}
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.55)), url('${imageSrc}')`,
        }}
      />

      <div className="relative z-10 flex h-full w-full items-center justify-center">
        <div ref={logoRef} className="text-center">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20 backdrop-blur">
            <span className="text-xl font-bold text-white">F</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">
            forth<span className="text-accent">.studio</span>
          </h1>
          <p className="mt-2 text-xs text-white/70">Loading studio…</p>
        </div>
        <button
          onClick={() => {
            try { sessionStorage.setItem('fs_splash_seen', '1'); } catch {}
            setVisible(false);
          }}
          className="absolute bottom-6 right-6 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur hover:text-white"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
