import type { ReactNode } from "react";

type PageIntroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function PageIntro({
  eyebrow,
  title,
  description,
  actions,
}: PageIntroProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-8 rounded-3xl border border-white/5 bg-surface/60 px-8 py-8 backdrop-blur">
      <div className="space-y-3">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">
          {title}
        </h1>
        <p className="max-w-2xl text-sm text-white/65 sm:text-base">
          {description}
        </p>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </header>
  );
}
