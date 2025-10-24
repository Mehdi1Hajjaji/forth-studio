'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

type FloatingOrbsProps = {
  count?: number;
  className?: string;
};

export function FloatingOrbs({ count = 6, className }: FloatingOrbsProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const orbs = Array.from(el.querySelectorAll<HTMLElement>('[data-orb]'));
    orbs.forEach((o, i) => {
      const x = (Math.random() - 0.5) * 40;
      const y = (Math.random() - 0.5) * 30;
      gsap.to(o, {
        x: `+=${x}`,
        y: `+=${y}`,
        duration: 10 + Math.random() * 10,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: i * 0.2,
      });
    });
  }, []);

  return (
    <div ref={ref} className={className ?? 'absolute inset-0 pointer-events-none'}>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          data-orb
          className="absolute h-24 w-24 rounded-full"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 70}%`,
            background:
              i % 2 === 0
                ? 'radial-gradient(circle, rgba(142,95,255,0.35) 0%, rgba(142,95,255,0) 60%)'
                : 'radial-gradient(circle, rgba(34,211,238,0.28) 0%, rgba(34,211,238,0) 60%)',
            filter: 'blur(6px)'
          }}
        />
      ))}
    </div>
  );
}
