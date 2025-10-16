"use client";

import React from "react";

type CodeEditorProps = {
  value?: string;
  onChange?: (value: string) => void;
  language?: string;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
};

export default function CodeEditor({
  value = "",
  onChange,
  className,
  placeholder = "Write your code here...",
  readOnly = false,
}: CodeEditorProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      spellCheck={false}
      className={
        "min-h-[200px] w-full rounded-lg border border-white/10 bg-black/40 p-3 font-mono text-sm text-white/90 outline-none focus:border-accent " +
        (className ?? "")
      }
    />
  );
}
