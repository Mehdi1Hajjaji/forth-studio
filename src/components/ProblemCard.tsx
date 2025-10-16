import React from "react";

type ProblemCardProps = {
  title?: string;
  summary?: string;
  difficulty?: string;
  href?: string;
  className?: string;
};

export default function ProblemCard({
  title = "Untitled Problem",
  summary = "No summary available.",
  difficulty = "UNKNOWN",
  href,
  className,
}: ProblemCardProps) {
  const Wrapper = href ? "a" : ("div" as const);
  const props = href ? { href, rel: "noreferrer" } : {};

  return (
    <Wrapper
      {...(props as any)}
      className={
        "block rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-accent " +
        (className ?? "")
      }
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <span className="text-xs font-medium text-white/60">{difficulty}</span>
      </div>
      <p className="mt-2 text-sm text-white/70">{summary}</p>
    </Wrapper>
  );
}
