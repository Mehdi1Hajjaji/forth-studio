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
    <section className="relative overflow-hidden rounded-[32px] border border-border/60 bg-surface/90 p-6 shadow-card-soft">
      <header className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Student Highlights</h3>
        <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
          Live
        </span>
      </header>
      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-background to-transparent" />
        <div ref={trackRef} className="flex gap-4">
          {items.map((item, i) => (
            <article
              key={i}
              data-card
              className={`relative w-72 shrink-0 rounded-[28px] border border-border/60 p-5 text-foreground shadow-card-soft transition-colors ${
                i === 0 ? 'bg-accent/12' : 'bg-surface/85'
              }`}
            >
              <div className="absolute -inset-px rounded-[28px] bg-gradient-to-br from-accent/20 via-transparent to-secondary/20 opacity-70 blur-2xl" />
              <div className="relative z-10">
                {item.badge ? (
                  <span className="mb-2 inline-flex rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-accent">
                    {item.badge}
                  </span>
                ) : null}
                <h4 className="text-lg font-semibold">{item.title}</h4>
                <p className="mt-1 text-sm text-muted">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
