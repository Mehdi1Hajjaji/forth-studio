"use client";

import React, { useState } from "react";

type VoteButtonsProps = {
  initialScore?: number;
  onVote?: (delta: 1 | -1) => void;
  className?: string;
};

export default function VoteButtons({
  initialScore = 0,
  onVote,
  className,
}: VoteButtonsProps) {
  const [score, setScore] = useState(initialScore);

  function handle(delta: 1 | -1) {
    setScore((s) => s + delta);
    onVote?.(delta);
  }

  return (
    <div className={"inline-flex items-center gap-2 " + (className ?? "") }>
      <button
        type="button"
        aria-label="Upvote"
        className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-white/80 hover:border-accent"
        onClick={() => handle(1)}
      >
        +
      </button>
      <span className="min-w-6 text-center text-sm text-white/80">{score}</span>
      <button
        type="button"
        aria-label="Downvote"
        className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-white/80 hover:border-accent"
        onClick={() => handle(-1)}
      >
        -
      </button>
    </div>
  );
}
