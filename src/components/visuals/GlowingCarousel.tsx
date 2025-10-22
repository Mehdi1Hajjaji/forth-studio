'use client';

import gsap from 'gsap';
import { useEffect, useRef } from 'react';

type Item = {
  title: string;
  description: string;
  badge?: string;
};

export function GlowingCarousel({ items }: { items: Item[] }) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const cards = Array.from(el.querySelectorAll<HTMLElement>('[data-card]'));
    // duplicate cards to create an infinite loop
    cards.forEach((c) => el.appendChild(c.cloneNode(true)));

    const totalWidth = cards.reduce((acc, c) => acc + c.offsetWidth + 16, 0);

    const tl = gsap.timeline({ repeat: -1 });
    tl.to(el, {
      x: -totalWidth,
      duration: Math.max(20, cards.length * 3),
      ease: 'none',
    });

    return () => {
      tl.kill();
      el.style.transform = '';
    };
  }, []);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-surface/70 p-6">
      <header className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Student Highlights</h3>
        <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">Live</span>
      </header>
      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-background to-transparent" />
        <div ref={trackRef} className="flex gap-4">
          {items.map((item, i) => (
            <article
              key={i}
              data-card
              className={
                `relative w-72 shrink-0 rounded-2xl border p-5 text-white shadow-card ` +
                (i === 0
                  ? 'border-lime-300/60 bg-lime-300/15'
                  : 'border-white/10 bg-white/5')
              }
            >
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-lime-300/20 via-indigo-500/10 to-blue-500/10 blur-2xl" />
              <div className="relative z-10">
                {item.badge ? (
                  <span className="mb-2 inline-flex rounded-full bg-accent/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-accent">
                    {item.badge}
                  </span>
                ) : null}
                <h4 className="text-lg font-semibold">{item.title}</h4>
                <p className="mt-1 text-sm text-white/70">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
