'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { HeroCanvas } from './HeroCanvas';
import { FloatingOrbs } from './FloatingOrbs';

export function ForthHero() {
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const subRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(
      titleRef.current,
      { autoAlpha: 0, y: 30, letterSpacing: '0.05em' },
      { autoAlpha: 1, y: 0, letterSpacing: '0em', duration: 1.2 }
    )
      .fromTo(subRef.current, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.8 }, '-=0.6');
  }, []);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-surface/80 py-20 shadow-card">
      <HeroCanvas className="absolute inset-0" />
      <FloatingOrbs />
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <div className="mx-auto mb-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
          forth.studio
        </div>
        <h1
          ref={titleRef}
          className="text-balance text-5xl font-extrabold tracking-tight text-white md:text-6xl lg:text-7xl"
        >
          <span className="[text-shadow:0_8px_42px_rgba(190,242,100,0.55)]">forth</span>
          <span className="text-accent">.studio</span>
        </h1>
        <p ref={subRef} className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
          A focused space to grow: challenges, project feedback and stories. Built for students and early engineers.
        </p>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_0%,rgba(99,102,241,0.35),transparent_60%)]" />
    </section>
  );
}
