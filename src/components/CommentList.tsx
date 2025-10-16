"use client";

import React from "react";

type Comment = {
  id: string;
  author: string;
  body: string;
};

type CommentListProps = {
  comments?: Comment[];
  className?: string;
};

export default function CommentList({ comments = [], className }: CommentListProps) {
  if (!comments.length) {
    return (
      <div
        className={
          "rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/60 " +
          (className ?? "")
        }
      >
        No comments yet.
      </div>
    );
  }

  return (
    <ul className={"space-y-3 " + (className ?? "") }>
      {comments.map((c) => (
        <li key={c.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
            {c.author}
          </p>
          <p className="mt-2 text-sm text-white/65">{c.body}</p>
        </li>
      ))}
    </ul>
  );
}
