'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import type { ProblemListItem } from '@/lib/data';

type SubmitFormProps = {
  problems: ProblemListItem[];
};

const languages = ['TypeScript', 'Python', 'C++', 'Java', 'Go', 'Rust'];

export function SubmitForm({ problems }: SubmitFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    const payload = {
      problemSlug: (form.get('problem') as string | null)?.trim() ?? '',
      language: (form.get('language') as string | null)?.trim() ?? '',
      code: (form.get('code') as string | null)?.toString() ?? '',
      notes: (form.get('notes') as string | null)?.toString() ?? undefined,
      makePublic: form.get('makePublic') === 'on',
    };

    if (!payload.problemSlug || !payload.language || !payload.code) {
      setError('Please complete all required fields before submitting.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message =
          data?.error ??
          (response.status === 401
            ? 'Please sign in before submitting a solution.'
            : 'Unable to submit solution. Please try again.');
        setError(message);
        return;
      }

      const result = await response.json().catch(() => null);
      setSuccess(
        result?.meta?.evaluation?.status === 'COMPLETED'
          ? 'Submission accepted! Mentor review will appear soon.'
          : 'Submission received. Evaluation is queued.',
      );
      event.currentTarget.reset();
    } catch (submissionError) {
      console.error(submissionError);
      setError('Unexpected error while submitting the solution.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Challenge" htmlFor="problem">
          <select
            id="problem"
            name="problem"
            defaultValue=""
            required
            className="auth-input"
          >
            <option value="" disabled>
              Select a challenge
            </option>
            {problems.map((problem) => (
              <option key={problem.slug} value={problem.slug}>
                {problem.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Language" htmlFor="language">
          <select
            id="language"
            name="language"
            defaultValue=""
            required
            className="auth-input"
          >
            <option value="" disabled>
              Choose a language
            </option>
            {languages.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        label="Solution code"
        htmlFor="code"
        helper="Paste your final snippet. Drafts auto-save while you type."
      >
        <textarea
          id="code"
          name="code"
          required
          rows={12}
          placeholder="// Paste your solution here"
          className="auth-input font-mono text-xs leading-relaxed"
        />
      </Field>

      <Field
        label="Approach notes"
        htmlFor="notes"
        helper="Explain key optimisations or trade-offs so peers can leave targeted feedback."
      >
        <textarea
          id="notes"
          name="notes"
          rows={4}
          className="auth-input"
          placeholder="Describe your thought process..."
        />
      </Field>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-xs text-white/60">
          <input
            name="makePublic"
            type="checkbox"
            className="h-4 w-4 rounded border-white/20 bg-transparent text-accent focus:ring-accent"
          />
          Make solution public after mentor review
        </label>
        <button
          type="submit"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:-translate-y-0.5 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting…' : 'Submit for review'}
        </button>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-100">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-100">
          {success}
        </p>
      ) : null}
    </form>
  );
}

function Field({
  label,
  htmlFor,
  helper,
  children,
}: {
  label: string;
  htmlFor: string;
  helper?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="text-sm font-semibold text-white/70 transition hover:text-white"
      >
        {label}
      </label>
      {children}
      {helper ? <p className="text-xs text-white/45">{helper}</p> : null}
    </div>
  );
}
