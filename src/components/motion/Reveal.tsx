'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

type RevealProps = {
  children: React.ReactNode;
  y?: number;
  delay?: number;
  className?: string;
};

export function Reveal({ children, y = 24, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.fromTo(
              el,
              { y, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', delay }
            );
            obs.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [y, delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

